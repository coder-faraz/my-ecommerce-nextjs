import { v2 as cloudinary } from 'cloudinary';
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import connectToDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import Product from '@/models/Product';
import { getCategoryIdByName } from "@/lib/categoryHelper";

// Configuration for cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request) {
    try {
        // Extract the authenticated user's ID from the request
        const { userId } = getAuth(request);
        if (!userId || !(await authSeller(userId))) {
            return NextResponse.json({ success: false, message: "Not Authorized" }, { status: 401 });
        }

        const formData = await request.formData();
        // Required fields
        const name = formData.get('name');
        const brand = formData.get('brand');
        const category = formData.get('category');
        const price = formData.get('price');
        // Optional fields
        const description = formData.get('description') || '';
        const color = formData.get('color') || '';
        const quantity = formData.get('quantity') || 0;
        const discountPercent = parseFloat(formData.get('discountPercent') || 0);
        const discountedPrice = parseFloat(formData.get('discountedPrice') || 0);
        // New fields
        const salesCount = parseInt(formData.get('salesCount') || 0);
        const isFeatured = formData.get('isFeatured') === 'true';
        const isActive = formData.get('isActive') === 'true';
        const isTrending = formData.get('isTrending') === 'true';
        const isNewArrival = formData.get('isNewArrival') === 'true';

        // Validate category and get category ID
        const categoryId = await getCategoryIdByName(category);

        if (!categoryId) {
            return NextResponse.json(
                { success: false, message: `Invalid category: ${category}. Please provide a valid category name.` },
                { status: 400 }
            );
        }

        const imgFiles = formData.getAll('images');
        if (!imgFiles || imgFiles.length === 0) {
            return NextResponse.json(
                { success: false, message: "No Image Files Uploaded" },
                { status: 404 }
            );
        }

        // Upload the images
        const result = await Promise.all(
            imgFiles.map(async file => {
                const arrayBuffer = await file.arrayBuffer();
                const normalBuffer = Buffer.from(arrayBuffer);
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            resource_type: 'auto',
                            folder: 'products', // optional folder
                            transformation: [
                                { width: 1024, crop: 'limit' },
                                { fetch_format: 'auto', quality: 'auto' }
                            ]
                        },
                        (err, result) => err ? reject(err) : resolve(result)
                    )
                    stream.end(normalBuffer);
                })
            })
        );

        const images = result.map(res => res.secure_url);
        console.log(images, 'image should contain urls');

        // Database connection
        await connectToDB();

        const newProduct = await Product.create({
            userId,
            name,
            description,
            brand,
            color,
            category,
            categoryId,
            quantity: Number(quantity),
            price: Number(price),
            discountPercent,
            discountedPrice,
            salesCount,
            isFeatured,
            isTrending,
            isNewArrival,
            isActive,
            images
        });

        return NextResponse.json({ success: true, message: 'Upload Successful', newProduct });
    } catch (error) {
        console.error(error, 'error in product route');
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}