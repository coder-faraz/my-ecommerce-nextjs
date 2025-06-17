import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import connectToDB from "@/config/db";
import Address from "@/models/Address";
import Product from "@/models/Product";
import Order from "@/models/Order";
import authSeller from "@/lib/authSeller";

/**
 * Handles GET requests to retrieve all orders for authorized sellers.
 *
 * Responsibilities:
 *  - Authenticate the user using Clerk.
 *  - Verify the user is a seller using `authSeller`.
 *  - Connect to MongoDB.
 *  - Fetch and return all orders, including populated fields.
 *
 * Returns:
 *  - 200 with order list if successful.
 *  - 404 if the user is unauthorized (not a seller).
 *  - 500 if a server or DB error occurs.
 */
export async function GET(request) {
    try {
        // Extract the authenticated user’s ID from the request
        const { userId } = getAuth(request);
        const isSeller = await authSeller(userId);
        // If user is not seller, return a 404-style JSON response
        if (!isSeller) {
            return NextResponse.json(
                { success: false, message: "Not Authorized" },
                { status: 404 }
            );
        }

        // Database connection
        await connectToDB();

        Address.length;
        Product.length;
        const orders = await Order.find({})
            .populate('shippingAddress items.productId')

        return NextResponse.json({ success: true, orders });
    } catch (error) {
        console.error(error, 'error in get seller-order route');
        // On any other error, return a 500-style JSON response
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
