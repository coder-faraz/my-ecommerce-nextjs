import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import connectToDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import Coupon from "@/models/Coupon";

/**
 * GET Handler - Fetch all coupons created by sellers.
 * 
 * - Verifies if the user is a seller.
 * - Connects to the database.
 * - Fetches all coupons from the collection.
 * - Returns coupons sorted by creation date (newest first).
 */
export async function GET(request) {
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
        const coupons = await Coupon.find({})
            .sort({ createdAt: -1 })
        // .populate('applicableProducts', 'name')
        // .populate('excludedProducts', 'name');

        return NextResponse.json({ success: true, coupons });
    } catch (error) {
        console.error('Error fetching coupons:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

/**
 * POST Handler - Create a new coupon.
 * 
 * - Verifies if the user is a seller.
 * - Validates request body for required fields.
 * - Checks if the coupon code is unique.
 * - Validates discount type and value.
 * - Creates and saves the new coupon document.
 */
export async function POST(request) {
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
        const couponData = await request.json();

        const {
            code,
            name,
            discountType,
            discountValue,
            startDate,
            expiryDate
        } = couponData;

        if (!code || !name || !discountType || !discountValue || !startDate || !expiryDate) {
            return NextResponse.json(
                { success: false, message: "Required fields missing" },
                { status: 400 }
            );
        }

        // Check if coupon code already exists
        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return NextResponse.json(
                { success: false, message: "Coupon code already exists" },
                { status: 400 }
            );
        }

        // Validate discount value
        if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
            return NextResponse.json(
                { success: false, message: "Percentage discount must be between 1-100" },
                { status: 400 }
            );
        }

        if (discountType === 'fixed' && discountValue <= 0) {
            return NextResponse.json(
                { success: false, message: "Fixed discount must be greater than 0" },
                { status: 400 }
            );
        }

        // Create new coupon
        const newCoupon = new Coupon({
            ...couponData,
            code: code.toUpperCase(),
            createdBy: userId
        });

        await newCoupon.save();

        return NextResponse.json({
            success: true,
            message: "Coupon created successfully",
            coupon: newCoupon
        });

    } catch (error) {
        console.error('Error creating coupon:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}