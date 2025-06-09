// app/api/coupons/apply/route.js
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectToDB from "@/config/db";
import Coupon from "@/models/Coupon";
import UserCouponUsage from "@/models/UserCouponUsage";
import User from "@/models/User";

export async function POST(request) {
    try {
        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Please login to apply coupons" },
                { status: 401 }
            );
        }

        const { couponCode, cartTotal, cartItems = [] } = await request.json();

        if (!couponCode || !cartTotal) {
            return NextResponse.json(
                { success: false, message: "Coupon code and cart total are required" },
                { status: 400 }
            );
        }

        await connectToDB();

        // Find the coupon
        const coupon = await Coupon.findOne({
            code: couponCode.toUpperCase(),
            isActive: true
        });

        if (!coupon) {
            return NextResponse.json(
                { success: false, message: "Invalid or expired coupon code" },
                { status: 400 }
            );
        }

        // Check if coupon is currently valid
        if (!coupon.isValid()) {
            return NextResponse.json(
                { success: false, message: "Coupon has expired or reached usage limit" },
                { status: 400 }
            );
        }

        // Check date validity
        const now = new Date();
        if (coupon.startDate > now) {
            return NextResponse.json(
                { success: false, message: "Coupon is not yet active" },
                { status: 400 }
            );
        }

        if (coupon.expiryDate <= now) {
            return NextResponse.json(
                { success: false, message: "Coupon has expired" },
                { status: 400 }
            );
        }

        // Check minimum order amount
        if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Minimum order amount of $${coupon.minOrderAmount} required`
                },
                { status: 400 }
            );
        }

        // Check maximum order amount
        if (coupon.maxOrderAmount && cartTotal > coupon.maxOrderAmount) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Maximum order amount of $${coupon.maxOrderAmount} exceeded`
                },
                { status: 400 }
            );
        }

        if (coupon.newUsersOnly) {
            // Check if user has made any previous orders
            const orderCount = await Order.countDocuments({ userId });
            if (orderCount > 0) {
                return NextResponse.json(
                    { success: false, message: "This coupon is only for new users" },
                    { status: 400 }
                );
            }
        }

        // Check user-specific restrictions
        if (coupon.applicableUsers.length > 0 && !coupon.applicableUsers.includes(userId)) {
            return NextResponse.json(
                { success: false, message: "You are not eligible for this coupon" },
                { status: 400 }
            );
        }

        // Check user usage limit
        if (coupon.userUsageLimit) {
            const userUsage = await UserCouponUsage.findOne({
                userId,
                couponId: coupon._id
            });

            if (userUsage && userUsage.usageCount >= coupon.userUsageLimit) {
                return NextResponse.json(
                    { success: false, message: "You have reached the usage limit for this coupon" },
                    { status: 400 }
                );
            }
        }

        // Validate product/category restrictions
        if (cartItems.length > 0) {
            const validationResult = await validateProductRestrictions(coupon, cartItems);
            if (!validationResult.valid) {
                return NextResponse.json(
                    { success: false, message: validationResult.message },
                    { status: 400 }
                );
            }
        }

        // Calculate discount
        const discountAmount = coupon.calculateDiscount(cartTotal);

        if (discountAmount === 0) {
            return NextResponse.json(
                { success: false, message: "Coupon cannot be applied to this order" },
                { status: 400 }
            );
        }

        // Return success with discount details
        return NextResponse.json({
            success: true,
            message: "Coupon applied successfully",
            coupon: {
                _id: coupon._id,
                code: coupon.code,
                name: coupon.name,
                description: coupon.description,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue
            },
            discount: {
                amount: discountAmount,
                type: coupon.discountType,
                originalTotal: cartTotal,
                finalTotal: cartTotal - discountAmount
            }
        });

    } catch (error) {
        console.error('Error applying coupon:', error);
        return NextResponse.json(
            { success: false, message: "Error applying coupon" },
            { status: 500 }
        );
    }
}

// Helper function to validate product/category restrictions
async function validateProductRestrictions(coupon, cartItems) {
    // If no restrictions, coupon applies to all products
    if (coupon.applicableProducts.length === 0 &&
        coupon.applicableCategories.length === 0 &&
        coupon.excludedProducts.length === 0 &&
        coupon.excludedCategories.length === 0) {
        return { valid: true };
    }

    // Check if any cart items match applicable products
    if (coupon.applicableProducts.length > 0) {
        const hasApplicableProduct = cartItems.some(item =>
            coupon.applicableProducts.some(productId =>
                productId.toString() === item.productId.toString()
            )
        );

        if (!hasApplicableProduct) {
            return {
                valid: false,
                message: "Coupon is not applicable to any items in your cart"
            };
        }
    }

    // Check if any cart items match applicable categories
    if (coupon.applicableCategories.length > 0) {
        const hasApplicableCategory = cartItems.some(item =>
            coupon.applicableCategories.includes(item.category)
        );

        if (!hasApplicableCategory) {
            return {
                valid: false,
                message: "Coupon is not applicable to any product categories in your cart"
            };
        }
    }

    // Check excluded products
    if (coupon.excludedProducts.length > 0) {
        const hasExcludedProduct = cartItems.some(item =>
            coupon.excludedProducts.some(productId =>
                productId.toString() === item.productId.toString()
            )
        );

        if (hasExcludedProduct) {
            return {
                valid: false,
                message: "Coupon cannot be applied due to excluded products in cart"
            };
        }
    }

    // Check excluded categories
    if (coupon.excludedCategories.length > 0) {
        const hasExcludedCategory = cartItems.some(item =>
            coupon.excludedCategories.includes(item.category)
        );

        if (hasExcludedCategory) {
            return {
                valid: false,
                message: "Coupon cannot be applied due to excluded product categories in cart"
            };
        }
    }

    return { valid: true };
}