import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import connectToDB from "@/config/db";
import User from "@/models/User";
import Product from "@/models/Product";
import { inngest } from "@/config/inngest";

/**
 * Handles order creation when a customer places an order.
 *
 * Responsibilities:
 *  - Authenticates the user via Clerk.
 *  - Validates payload (address and items).
 *  - Fetches product info from DB and calculates price breakdown.
 *  - Computes totals, tax, and shipping fee.
 *  - Emits an Inngest event (`order/created`) for async processing:
 *      - Order storage
 *      - Inventory update
 *  - Clears user's cart.
 *
 * Returns a success response if everything is valid and event is sent.
 */
export async function POST(request) {
    try {
        // 1) Auth
        const { userId } = getAuth(request);

        // 2) Payload
        const { addressId, items: rawItems = [], promoCode = "" } = await request.json();
        if (!addressId || rawItems.length === 0) {
            return NextResponse.json({ success: false, message: "Missing required data" });
        }

        // 3) Load user & cart
        await connectToDB();
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        // 4) Build enriched line items & compute itemsTotal
        let itemsTotal = 0;
        const items = await Promise.all(
            rawItems.map(async ({ productId, quantity }) => {
                const prod = await Product.findById(productId);
                if (!prod) {
                    throw new Error(`Product ${productId} not found`);
                }
                const price = prod.discountedPrice ?? prod.price;
                const subtotal = +(price * quantity).toFixed(2);
                itemsTotal += subtotal;
                return {
                    productId,                     // ObjectId string
                    name: prod.name,               // snapshot name
                    image: prod.images[0] ?? '',   // snapshot image
                    price,
                    quantity,
                    subtotal
                };
            })
        );

        // 5) Totals, fees, tax
        const itemsCount = items.length;
        const shippingFee = itemsTotal > 100 ? 0 : 10;         // example rule
        const taxPercent = 2;                                 // 2%
        const taxAmount = +(itemsTotal * (taxPercent / 100)).toFixed(2);
        const discountAmount = 0;                                // apply promoCode logic here
        const totalAmount = +(itemsTotal + shippingFee + taxAmount - discountAmount).toFixed(2);

        // 6) Emit Inngest event — data needed to create the order
        await inngest.send({
            name: "order/created",
            data: {
                userId,
                addressId,
                promoCode,
                items,
                itemsCount,
                itemsTotal,
                shippingFee,
                taxPercent,
                taxAmount,
                discountAmount,
                totalAmount
            }
        });
        // Clear user's cart after placing order
        user.cartItems = {};
        await user.save();

        return NextResponse.json({ success: true, message: "Order Placed Successfully" });

    } catch (err) {
        console.error("Order create API Error:", err);
        return NextResponse.json(
            { success: false, message: err.message || "Internal server error" },
            { status: 500 }
        );
    }
}
