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

        // If user is not seller, return a 404-style JSON response
        if (!isSeller) {
            return NextResponse.json(
                { success: false, message: "Not Authorized" },
                { status: 404 }
            );
        }

        // Database connection
        await connectToDB();
        const allProducts = await Product.find({})
            .populate('categoryId', 'name') // Populate category name from categoryId
            .sort({ createdAt: -1 });

        // If no product is found, return a 404-style JSON response
        if (!allProducts || allProducts.length === 0) {
            return NextResponse.json(
                { success: false, message: "Products Not Found" },
                { status: 404 }
            );
        }
        // Transform the data to include category name properly
        const transformedProducts = allProducts.map(product => ({
            ...product.toObject(),
            categoryName: product.categoryId?.name || product.category,
        }));

        // Return the products
        return NextResponse.json({ success: true, allProducts: transformedProducts });
    } catch (error) {
        console.error(error, 'error in get products route');
        // On any other error, return a 500-style JSON response
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
