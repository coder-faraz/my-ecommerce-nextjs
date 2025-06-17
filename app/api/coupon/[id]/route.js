import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import connectToDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import Coupon from "@/models/Coupon";
import User from "@/models/User";
import UserCouponUsage from "@/models/UserCouponUsage";

// UPDATE - Update existing coupon (Seller Only)
export async function PUT(request, { params }) {
    try {
        const { userId } = getAuth(request);
        const isSeller = await authSeller(userId);

        if (!isSeller) {
            return NextResponse.json(
                { success: false, message: "Not Authorized" },
                { status: 404 }
            );
        }

        await connectToDB();
        const couponId = params.id;
        const updateData = await request.json();

        // If code is being updated, check for duplicates
        if (updateData.code) {
            const existingCoupon = await Coupon.findOne({
                code: updateData.code.toUpperCase(),
                _id: { $ne: couponId }
            });

            if (existingCoupon) {
                return NextResponse.json(
                    { success: false, message: "Coupon code already exists" },
                    { status: 400 }
                );
            }
            updateData.code = updateData.code.toUpperCase();
        }

        // Validate discount value if being updated
        if (updateData.discountType && updateData.discountValue) {
            if (updateData.discountType === 'percentage' &&
                (updateData.discountValue <= 0 || updateData.discountValue > 100)) {
                return NextResponse.json(
                    { success: false, message: "Percentage discount must be between 1-100" },
                    { status: 400 }
                );
            }

            if (updateData.discountType === 'fixed' && updateData.discountValue <= 0) {
                return NextResponse.json(
                    { success: false, message: "Fixed discount must be greater than 0" },
                    { status: 400 }
                );
            }
        }

        const updatedCoupon = await Coupon.findByIdAndUpdate(
            couponId,
            { ...updateData, updatedAt: Date.now() },
            { new: true }
        );

        if (!updatedCoupon) {
            return NextResponse.json(
                { success: false, message: "Coupon not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Coupon updated successfully",
            coupon: updatedCoupon
        });

    } catch (error) {
        console.error('Error updating coupon:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// DELETE - Delete coupon (Seller Only)
export async function DELETE(request, { params }) {
    try {
        const { userId } = getAuth(request);
        const isSeller = await authSeller(userId);

        if (!isSeller) {
            return NextResponse.json(
                { success: false, message: "Not Authorized" },
                { status: 404 }
            );
        }

        await connectToDB();
        const couponId = params.id;

        // Check if coupon exists and has been used
        const coupon = await Coupon.findById(couponId);
        if (!coupon) {
            return NextResponse.json(
                { success: false, message: "Coupon not found" },
                { status: 404 }
            );
        }

        // If coupon has been used, just deactivate it instead of deleting
        if (coupon.usageCount > 0) {
            await Coupon.findByIdAndUpdate(couponId, { isActive: false });
            return NextResponse.json({
                success: true,
                message: "Coupon deactivated (cannot delete used coupons)"
            });
        }

        // Delete the coupon and related usage records
        await Coupon.findByIdAndDelete(couponId);
        await UserCouponUsage.deleteMany({ couponId });

        return NextResponse.json({
            success: true,
            message: "Coupon deleted successfully"
        });

    } catch (error) {
        console.error('Error deleting coupon:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// GET - Get single coupon details (Seller only)
export async function GET(request, { params }) {
    try {
        const { userId } = getAuth(request);
        const isSeller = await authSeller(userId);

        if (!isSeller) {
            return NextResponse.json(
                { success: false, message: "Not Authorized" },
                { status: 404 }
            );
        }

        await connectToDB();
        const couponId = params.id;
        const coupon = await Coupon.findById(couponId)
            .populate('applicableProducts', 'name')
            .populate('excludedProducts', 'name');

        if (!coupon) {
            return NextResponse.json(
                { success: false, message: "Coupon not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(coupon);

    } catch (error) {
        console.error('Error fetching coupon:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}