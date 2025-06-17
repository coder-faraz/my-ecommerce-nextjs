import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

import connectToDB from '@/config/db';
import authSeller from '@/lib/authSeller';
import Category from '@/models/Category';

// GET: Fetch all categories with populated parent names - this is a seller dashboard api
export async function GET(request) {
    try {
        // Extract the authenticated user’s ID from the request
        const { userId } = getAuth(request);
        if (!userId || !(await authSeller(userId))) {
            return NextResponse.json({ success: false, message: 'Not Authorized' }, { status: 401 });
        }

        // Connect to the database
        await connectToDB();

        const categories = await Category.find();
        if (!categories || categories.length === 0) {
            return NextResponse.json(
                { success: false, message: "Categories Not Found" },
                { status: 404 }
            );
        }
        return NextResponse.json({ success: true, categories });
    } catch (error) {
        console.error(error, 'error in category GET route');
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}