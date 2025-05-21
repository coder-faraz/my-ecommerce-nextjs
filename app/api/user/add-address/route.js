import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import connectToDB from "@/config/db";
import Address from "@/models/Address";

export async function POST(request) {
    try {
        // Extract the authenticated user’s ID from the request
        const { userId } = getAuth(request);
        const { address } = await request.json();
        await connectToDB();

        const newAddress = await Address.create({ ...address, userId });
        return NextResponse.json(
            { success: true, message: "Added Successfully", newAddress }
        );

    } catch (error) {
        console.error(error, 'error in post address route');
        // On any other error, return a 500-style JSON response
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
