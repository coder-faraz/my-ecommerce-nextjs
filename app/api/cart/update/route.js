import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import connectToDB from "@/config/db";
import User from "@/models/User";

export async function POST(request) {
    try {
        // Extract the authenticated user’s ID from the request
        const { userId } = getAuth(request);
        const { cartData } = await request.json();

        // Database connection
        await connectToDB();

        const user = await User.findById(userId);
        // If no user is found, return a 404-style JSON response
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User Not Found" },
                { status: 404 }
            );
        }
        user.cartItems = cartData;
        await user.save();
        // Otherwise return the user data
        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error(error, 'error in post cart route');
        // On any other error, return a 500-style JSON response
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
