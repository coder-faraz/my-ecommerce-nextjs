import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import connectToDB from "@/config/db";
import Address from "@/models/Address";
import Product from "@/models/Product";
import Order from "@/models/Order";

/**
 * Handles GET requests to retrieve a user's orders.
 *
 * Responsibilities:
 *  - Authenticate the user using Clerk.
 *  - Connect to MongoDB.
 *  - Fetch orders placed by the user.
 *  - Populate associated fields: shipping address and ordered product details.
 * 
 * Returns:
 *  - JSON response with the list of orders or appropriate error messages.
 */
export async function GET(request) {
    try {
        // Extract the authenticated user’s ID from the request
        const { userId } = getAuth(request);

        // Database connection
        await connectToDB();

        Address.length;
        Product.length;
        const orders = await Order.find({ userId })
            .populate('shippingAddress items.productId')

        return NextResponse.json({ success: true, orders });
    } catch (error) {
        console.error(error, 'error in get order route');
        // On any other error, return a 500-style JSON response
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
