import { NextResponse } from "next/server";

import connectToDB from "@/config/db";
import Product from "@/models/Product";

export async function GET(request) {
    try {
        // Extract query parameters from the request URL
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get("categoryId");
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 12;
        const offset = parseInt(searchParams.get("offset")) || 0;

        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");
        const minRating = searchParams.get("minRating");
        const sortBy = searchParams.get("sortBy");
        const searchTerm = searchParams.get("search");

        const query = {};

        // Category filter
        if (categoryId) {
            query.categoryId = categoryId;
        }

        // Price filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        // Rating filter
        if (minRating) {
            query.rating = { $gte: parseFloat(minRating) };
        }

        // Search filter
        if (searchTerm) {
            query.$or = [
                { name: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } }
            ];
        }

        // Build sort object
        let sortObj = { createdAt: -1 }; // default sort by newest

        switch (sortBy) {
            case 'priceLowToHigh':
                sortObj = { price: 1 };
                break;
            case 'priceHighToLow':
                sortObj = { price: -1 };
                break;
            case 'rating':
                sortObj = { rating: -1 };
                break;
            case 'nameAZ':
                sortObj = { name: 1 };
                break;
            case 'nameZA':
                sortObj = { name: -1 };
                break;
            case 'newest':
            default:
                sortObj = { createdAt: -1 };
                break;
        }

        await connectToDB();
        const totalCount = await Product.countDocuments(query);

        // Calculate skip value
        const skip = (page - 1) * limit;

        const allProducts = await Product.find(query)
            .populate('categoryId', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        if (!allProducts || allProducts.length === 0) {
            return NextResponse.json(
                { success: false, message: "Products Not Found" },
                { status: 404 }
            );
        }
        // Get price range for filter slider
        const priceStats = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    minPrice: { $min: "$price" },
                    maxPrice: { $max: "$price" }
                }
            }
        ]);

        // Get available ratings
        const ratingStats = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    ratings: { $addToSet: "$rating" }
                }
            }
        ]);

        // Return products with metadata
        return NextResponse.json({
            success: true,
            allProducts,
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            hasNextPage: page < Math.ceil(totalCount / limit),
            hasPrevPage: page > 1,
            metadata: {
                totalCount: allProducts.length,
                priceRange: priceStats[0] || { minPrice: 0, maxPrice: 100000 },
                availableRatings: ratingStats[0]?.ratings?.filter(r => r != null).sort((a, b) => b - a) || []
            }
        });

    } catch (error) {
        console.error(error, 'error in get products route');
        // On any other error, return a 500-style JSON response
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
