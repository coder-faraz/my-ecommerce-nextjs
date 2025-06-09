import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import connectToDB from "@/config/db";
import User from "@/models/User";

export async function POST(request) {
    try {
        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { productId } = await request.json();

        if (!productId) {
            return NextResponse.json(
                { success: false, message: "Product ID is required" },
                { status: 400 }
            );
        }

        await connectToDB();

        // Add product to wishlist if not already present
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { wishlistItems: productId } }, // $addToSet prevents duplicates
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json(
                { success: false, message: "User Not Found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Product added to wishlist",
            wishlistItems: updatedUser.wishlistItems
        });

    } catch (error) {
        console.error(error, 'error in add to wishlist route');
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { productId } = await request.json();

        if (!productId) {
            return NextResponse.json(
                { success: false, message: "Product ID is required" },
                { status: 400 }
            );
        }

        await connectToDB();

        // Remove product from wishlist
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $pull: { wishlistItems: productId } },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json(
                { success: false, message: "User Not Found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Product removed from wishlist",
            wishlistItems: updatedUser.wishlistItems
        });

    } catch (error) {
        console.error(error, 'error in remove from wishlist route');
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}