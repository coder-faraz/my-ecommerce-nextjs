import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import connectToDB from "@/config/db";
import Address from "@/models/Address";

export async function GET(request) {
    try {
        // Extract the authenticated user’s ID from the request
        const { userId } = getAuth(request);

        // Database connection
        await connectToDB();

        const addresses = await Address.find({ userId });
        return NextResponse.json(
            { success: true, addresses }
        );
    } catch (error) {
        console.error(error, 'error in get address route');
        // On any other error, return a 500-style JSON response
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
