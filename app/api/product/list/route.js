import { NextResponse } from "next/server";

import connectToDB from "@/config/db";
import Product from "@/models/Product";
import Category from "@/models/Category";

export async function GET(request) {
    try {
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

        // New filter parameters
        const filterType = searchParams.get("filterType"); // 'latest', 'topRated', 'bestSelling', 'featured'

        const query = { isActive: true }; // Only show active products

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

        // Filter by product type
        switch (filterType) {
            case 'latest':
                // Products created in last 30 days
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                query.createdAt = { $gte: thirtyDaysAgo };
                break;
            case 'topRated':
                query.rating = { $gte: 3 };
                query.reviewCount = { $gt: 0 };
                break;
            case 'bestSelling':
                query.salesCount = { $gte: 1 };
                break;
            case 'featured':
                query.isFeatured = true;
                break;
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
                sortObj = { rating: -1, reviewCount: -1 };
                break;
            case 'nameAZ':
                sortObj = { name: 1 };
                break;
            case 'nameZA':
                sortObj = { name: -1 };
                break;
            case 'bestSelling':
                sortObj = { salesCount: -1 };
                break;
            case 'newest':
            default:
                sortObj = { createdAt: -1 };
                break;
        }

        // Special sorting for filter types
        if (filterType === 'topRated') {
            sortObj = { rating: -1, reviewCount: -1 };
        } else if (filterType === 'bestSelling') {
            sortObj = { salesCount: -1 };
        } else if (filterType === 'featured') {
            sortObj = { createdAt: -1 };
        }

        await connectToDB();
        const totalCount = await Product.countDocuments(query);

        const skip = (page - 1) * limit;

        const allProducts = await Product.find(query)
            .populate('categoryId', 'name')
            .sort(sortObj)
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
            { $match: { isActive: true } },
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
            { $match: { isActive: true } },
            {
                $group: {
                    _id: null,
                    ratings: { $addToSet: "$rating" }
                }
            }
        ]);

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
                availableRatings: ratingStats[0]?.ratings?.filter(r => r != null).sort((a, b) => b - a) || [],
                filterType
            }
        });

    } catch (error) {
        console.error(error, 'error in get products route');
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}