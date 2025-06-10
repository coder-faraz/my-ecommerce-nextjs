import { NextResponse } from "next/server";
import mongoose from 'mongoose';

import connectToDB from "@/config/db";
import Review from "@/models/Review";
import Product from "@/models/Product";
import User from "@/models/User";

// GET - Fetch approved reviews for a specific product (public)
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get("productId");
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 10;

        if (!productId) {
            return NextResponse.json(
                { success: false, message: "Product ID is required" },
                { status: 400 }
            );
        }
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return NextResponse.json(
                { success: false, message: "Invalid Product ID format" },
                { status: 400 }
            );
        }

        await connectToDB();
        const skip = (page - 1) * limit;

        // Get only approved reviews with user details using aggregation
        const reviewsWithUsers = await Review.aggregate([
            {
                $match: {
                    productId: new mongoose.Types.ObjectId(productId),
                    status: 'approved' // Only show approved reviews
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $addFields: {
                    userName: {
                        $cond: {
                            if: { $gt: [{ $size: '$userDetails' }, 0] },
                            then: { $arrayElemAt: ['$userDetails.name', 0] },
                            else: 'Anonymous User'
                        }
                    },
                    userEmail: {
                        $cond: {
                            if: { $gt: [{ $size: '$userDetails' }, 0] },
                            then: { $arrayElemAt: ['$userDetails.email', 0] },
                            else: null
                        }
                    }
                }
            },
            {
                $project: {
                    productId: 1,
                    userId: 1,
                    rating: 1,
                    comment: 1,
                    status: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    userName: 1,
                    userEmail: 1
                }
            }
        ]);

        // Count only approved reviews
        const totalReviews = await Review.countDocuments({
            productId,
            status: 'approved'
        });

        // Calculate rating statistics based on approved reviews only
        const ratingStats = await Review.aggregate([
            {
                $match: {
                    productId: new mongoose.Types.ObjectId(productId),
                    status: 'approved'
                }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                    ratingDistribution: {
                        $push: "$rating"
                    }
                }
            }
        ]);

        // Calculate rating distribution
        let distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        if (ratingStats.length > 0) {
            ratingStats[0].ratingDistribution.forEach(rating => {
                distribution[rating] = (distribution[rating] || 0) + 1;
            });
        }

        const stats = ratingStats.length > 0 ? {
            averageRating: Math.round(ratingStats[0].averageRating * 10) / 10,
            totalReviews: ratingStats[0].totalReviews,
            distribution
        } : {
            averageRating: 0,
            totalReviews: 0,
            distribution
        };

        return NextResponse.json({
            success: true,
            reviews: reviewsWithUsers,
            stats,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalReviews / limit),
                hasNextPage: page < Math.ceil(totalReviews / limit),
                hasPrevPage: page > 1,
                totalReviews
            }
        });

    } catch (error) {
        console.error("Error fetching reviews:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// Function to update product statistics (only approved reviews)
async function updateProductStats(productId) {
    try {
        const stats = await Review.aggregate([
            {
                $match: {
                    productId: new mongoose.Types.ObjectId(productId),
                    status: 'approved'
                }
            },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        const avgRating = stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0;
        const reviewCount = stats.length > 0 ? stats[0].totalReviews : 0;

        // Update the product
        await Product.findByIdAndUpdate(productId, {
            rating: avgRating,
            reviewCount: reviewCount
        });

        console.log(`Product ${productId} updated: rating=${avgRating}, reviewCount=${reviewCount}`);
    } catch (error) {
        console.error('Error updating product stats:', error);
        throw error;
    }
}

// POST - Add a new review (status: pending by default)
export async function POST(request) {
    try {
        const { productId, userId, rating, comment } = await request.json();

        if (!productId || !userId || !rating) {
            return NextResponse.json(
                { success: false, message: "All fields are required" },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { success: false, message: "Rating must be between 1 and 5" },
                { status: 400 }
            );
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return NextResponse.json(
                { success: false, message: "Invalid Product ID format" },
                { status: 400 }
            );
        }

        await connectToDB();

        // Check if user already reviewed this product
        // only block if they have a pending or approved review
        const existingReview = await Review.findOne({
            productId,
            userId,
            status: { $ne: 'rejected' }
        });

        if (existingReview) {
            return NextResponse.json(
                { success: false, message: "You have already reviewed this product" },
                { status: 400 }
            );
        }

        // Verify product exists
        const product = await Product.findById(productId);
        if (!product) {
            return NextResponse.json(
                { success: false, message: "Product not found" },
                { status: 404 }
            );
        }

        // Create new review with pending status
        const newReview = new Review({
            productId,
            userId,
            rating,
            comment,
            status: 'pending' // Default status is pending
        });

        await newReview.save();

        // Don't update product stats yet since review is pending
        // Stats will be updated when review is approved

        return NextResponse.json({
            success: true,
            message: "Review submitted successfully and is pending approval",
            review: newReview
        });

    } catch (error) {
        console.error("Error adding review:", error);
        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, message: "You have already reviewed this product" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
