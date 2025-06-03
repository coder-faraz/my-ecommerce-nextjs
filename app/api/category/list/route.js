import { NextResponse } from 'next/server';

import connectToDB from '@/config/db';
import Category from '@/models/Category';

// GET: Fetch all categories with populated parent names
export async function GET(request) {
    try {
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