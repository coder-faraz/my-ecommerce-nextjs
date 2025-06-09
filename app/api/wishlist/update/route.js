import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import connectToDB from "@/config/db";
import User from "@/models/User";

export async function POST(request) {
    try {
        // Extract the authenticated user's ID from the request
        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { wishlistData } = await request.json();

        // Validate wishlistData
        if (!Array.isArray(wishlistData)) {
            return NextResponse.json(
                { success: false, message: "Invalid wishlist data format" },
                { status: 400 }
            );
        }

        // Database connection
        await connectToDB();

        // Update user's wishlist
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { wishlistItems: wishlistData },
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
            message: "Wishlist updated successfully",
            wishlistItems: updatedUser.wishlistItems
        });

    } catch (error) {
        console.error(error, 'error in update wishlist update');
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}