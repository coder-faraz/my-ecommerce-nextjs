import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import connectToDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import Product from "@/models/Product";

export async function GET(request) {
    try {
        // Extract the authenticated user’s ID from the request
        const { userId } = getAuth(request);
        const isSeller = await authSeller(userId);

        // If no user is found, return a 404-style JSON response
        if (!isSeller) {
            return NextResponse.json(
                { success: false, message: "Not Authorized" },
                { status: 404 }
            );
        }

        // Database connection
        await connectToDB();

        // Look up the user by their ID
        const allProducts = await Product.find({});

        // If no user is found, return a 404-style JSON response
        if (!allProducts) {
            return NextResponse.json(
                { success: false, message: "Products Not Found" },
                { status: 404 }
            );
        }
        // Otherwise return the user data
        return NextResponse.json({ success: true, allProducts });
    } catch (error) {
        console.error(error, 'error in get products route');
        // On any other error, return a 500-style JSON response
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
