import { NextResponse } from "next/server";

import connectToDB from "@/config/db";
import Product from "@/models/Product";

export async function GET(request) {
    try {
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
