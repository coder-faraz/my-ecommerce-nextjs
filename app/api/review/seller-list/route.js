import { NextResponse } from "next/server";
import mongoose from 'mongoose';

import connectToDB from "@/config/db";
import Review from "@/models/Review";
import Product from "@/models/Product";

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

// GET - Fetch all reviews for seller (pending, approved, rejected)
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get("productId");
        const status = searchParams.get("status") || "all";
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 10;

        await connectToDB();
        const skip = (page - 1) * limit;

        // Build match criteria
        let matchCriteria = {};
        if (status !== "all") {
            matchCriteria.status = status;
        }
        if (productId && mongoose.Types.ObjectId.isValid(productId)) {
            matchCriteria.productId = new mongoose.Types.ObjectId(productId);
        }

        // Get reviews with user and product details
        const reviewsWithDetails = await Review.aggregate([
            { $match: matchCriteria },
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
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'approvedBy',
                    foreignField: '_id',
                    as: 'approverDetails'
                }
            },
            {
                $addFields: {
                    userName: {
                        $cond: {
                            if: { $gt: [{ $size: '$userDetails' }, 0] },
                            then: { $arrayElemAt: ['$userDetails.username', 0] },
                            else: 'Anonymous User'
                        }
                    },
                    userEmail: {
                        $cond: {
                            if: { $gt: [{ $size: '$userDetails' }, 0] },
                            then: { $arrayElemAt: ['$userDetails.email', 0] },
                            else: null
                        }
                    },
                    productName: {
                        $cond: {
                            if: { $gt: [{ $size: '$productDetails' }, 0] },
                            then: { $arrayElemAt: ['$productDetails.name', 0] },
                            else: 'Unknown Product'
                        }
                    },
                    productImage: {
                        $cond: {
                            if: { $gt: [{ $size: '$productDetails' }, 0] },
                            then: { $arrayElemAt: ['$productDetails.images', 0] },
                            else: null
                        }
                    },
                    approverName: {
                        $cond: {
                            if: { $gt: [{ $size: '$approverDetails' }, 0] },
                            then: { $arrayElemAt: ['$approverDetails.username', 0] },
                            else: null
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    productId: 1,
                    userId: 1,
                    rating: 1,
                    comment: 1,
                    status: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    approvedAt: 1,
                    rejectionReason: 1,
                    userName: 1,
                    userEmail: 1,
                    productName: 1,
                    productImage: 1,
                    approverName: 1
                }
            }
        ]);

        // Get total count for pagination
        const totalReviews = await Review.countDocuments(matchCriteria);

        // Get status counts for dashboard
        const statusCounts = await Review.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const counts = {
            pending: 0,
            approved: 0,
            rejected: 0,
            total: totalReviews
        };

        statusCounts.forEach(item => {
            counts[item._id] = item.count;
        });

        return NextResponse.json({
            success: true,
            reviews: reviewsWithDetails,
            counts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalReviews / limit),
                hasNextPage: page < Math.ceil(totalReviews / limit),
                hasPrevPage: page > 1,
                totalReviews
            }
        });

    } catch (error) {
        console.error("Error fetching admin reviews:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// PUT - Approve or reject review
export async function PUT(request) {
    try {
        const { reviewId, action, userId, rejectionReason } = await request.json();

        if (!reviewId || !action || !userId) {
            return NextResponse.json(
                { success: false, message: "Review ID, action and userId are required" },
                { status: 400 }
            );
        }

        if (!['approve', 'reject'].includes(action)) {
            return NextResponse.json(
                { success: false, message: "Action must be 'approve' or 'reject'" },
                { status: 400 }
            );
        }

        if (action === 'reject' && !rejectionReason) {
            return NextResponse.json(
                { success: false, message: "Rejection reason is required" },
                { status: 400 }
            );
        }

        await connectToDB();

        const review = await Review.findById(reviewId);
        if (!review) {
            return NextResponse.json(
                { success: false, message: "Review not found" },
                { status: 404 }
            );
        }

        if (review.status !== 'pending') {
            return NextResponse.json(
                { success: false, message: "Review has already been processed" },
                { status: 400 }
            );
        }

        // Update review status
        const updateData = {
            status: action === 'approve' ? 'approved' : 'rejected',
            approvedBy: userId,
            approvedAt: new Date()
        };

        if (action === 'reject') {
            updateData.rejectionReason = rejectionReason;
        }

        await Review.findByIdAndUpdate(reviewId, updateData);

        // Update product statistics if approved
        if (action === 'approve') {
            await updateProductStats(review.productId);
        }

        return NextResponse.json({
            success: true,
            message: `Review ${action === 'approve' ? 'approved' : 'rejected'} successfully`
        });

    } catch (error) {
        console.error("Error updating review status:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// DELETE - Delete a review
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const reviewId = searchParams.get("reviewId");

        if (!reviewId) {
            return NextResponse.json(
                { success: false, message: "Review ID is required" },
                { status: 400 }
            );
        }

        await connectToDB();

        const review = await Review.findById(reviewId);
        if (!review) {
            return NextResponse.json(
                { success: false, message: "Review not found" },
                { status: 404 }
            );
        }

        const productId = review.productId;
        await Review.findByIdAndDelete(reviewId);

        // Update product statistics after deletion
        await updateProductStats(productId);

        return NextResponse.json({
            success: true,
            message: "Review deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting review:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}