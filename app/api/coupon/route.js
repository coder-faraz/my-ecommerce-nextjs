import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import connectToDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import Coupon from "@/models/Coupon";

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

// POST - Create New Coupon
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