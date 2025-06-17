import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectToDB from "@/config/db";
import Coupon from "@/models/Coupon";
import UserCouponUsage from "@/models/UserCouponUsage";

/**
 * GET Handler to retrieve all valid and applicable coupons for a user based on their cart.
 * Performs authentication, filters coupons based on eligibility, usage, cart value, 
 * and restrictions, then returns the best available ones.
 */
export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        const { searchParams } = new URL(request.url);
        const cartTotal = parseFloat(searchParams.get('cartTotal')) || 0;
        const cartItems = JSON.parse(searchParams.get('cartItems') || '[]');

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Please login to view available coupons" },
                { status: 401 }
            );
        }

        await connectToDB();

        // Find all active coupons that are currently valid
        const now = new Date();
        const allCoupons = await Coupon.find({
            isActive: true,
            startDate: { $lte: now },
            expiryDate: { $gt: now },
            $or: [
                { usageLimit: { $exists: false } },
                { usageLimit: null },
                { $expr: { $lt: ['$usageCount', '$usageLimit'] } }
            ]
        }).sort({ discountValue: -1 });

        // Get user's coupon usage
        const userCouponUsages = await UserCouponUsage.find({ userId });
        const userUsageMap = new Map();
        userCouponUsages.forEach(usage => {
            userUsageMap.set(usage.couponId.toString(), usage.usageCount);
        });

        // Filter coupons based on user eligibility and cart conditions
        const availableCoupons = [];

        for (const coupon of allCoupons) {
            // Check user usage limit
            if (coupon.userUsageLimit) {
                const userUsage = userUsageMap.get(coupon._id.toString()) || 0;
                if (userUsage >= coupon.userUsageLimit) {
                    continue;
                }
            }

            // Check user-specific restrictions
            if (coupon.applicableUsers.length > 0 && !coupon.applicableUsers.includes(userId)) {
                continue;
            }

            // Check order amount conditions
            if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
                continue;
            }

            if (coupon.maxOrderAmount && cartTotal > coupon.maxOrderAmount) {
                continue;
            }

            if (coupon.newUsersOnly) {
                // You can implement order history check here
                const orderCount = await Order.countDocuments({ userId });
                if (orderCount > 0) continue;
            }

            if (cartItems.length > 0) {
                const validationResult = await validateProductRestrictions(coupon, cartItems);
                if (!validationResult.valid) {
                    continue;
                }
            }

            // Calculate potential discount
            const discountAmount = coupon.calculateDiscount(cartTotal);

            if (discountAmount > 0) {
                availableCoupons.push({
                    _id: coupon._id,
                    code: coupon.code,
                    name: coupon.name,
                    description: coupon.description,
                    discountType: coupon.discountType,
                    discountValue: coupon.discountValue,
                    maxDiscountAmount: coupon.maxDiscountAmount,
                    minOrderAmount: coupon.minOrderAmount,
                    expiryDate: coupon.expiryDate,
                    potentialDiscount: discountAmount,
                    finalTotal: cartTotal - discountAmount,
                    userUsageLeft: coupon.userUsageLimit ?
                        coupon.userUsageLimit - (userUsageMap.get(coupon._id.toString()) || 0) :
                        null
                });
            }
        }

        return NextResponse.json({
            success: true,
            coupons: availableCoupons,
            cartTotal,
            totalCoupons: availableCoupons.length
        });
    } catch (error) {
        console.error('Error fetching available coupons:', error);
        return NextResponse.json({ success: false, message: "Error fetching available coupons" }, { status: 500 });
    }
}

/**
 * Helper function to validate product and category restrictions for a coupon.
 * Checks whether products in the cart match allowed or excluded products/categories.
 *
 * @param {Object} coupon - Coupon document from database
 * @param {Array} cartItems - List of cart item objects with productId and category
 * @returns {Object} - { valid: boolean, message?: string }
 */
async function validateProductRestrictions(coupon, cartItems) {
    if (coupon.applicableProducts.length === 0 &&
        coupon.applicableCategories.length === 0 &&
        coupon.excludedProducts.length === 0 &&
        coupon.excludedCategories.length === 0) {
        return { valid: true };
    }

    if (coupon.applicableProducts.length > 0) {
        const hasApplicableProduct = cartItems.some(item =>
            coupon.applicableProducts.some(productId =>
                productId.toString() === item.productId.toString()
            )
        );
        if (!hasApplicableProduct) {
            return { valid: false, message: "Coupon is not applicable to any items in your cart" };
        }
    }

    if (coupon.applicableCategories.length > 0) {
        const hasApplicableCategory = cartItems.some(item =>
            coupon.applicableCategories.includes(item.category)
        );
        if (!hasApplicableCategory) {
            return { valid: false, message: "Coupon is not applicable to any product categories in your cart" };
        }
    }

    if (coupon.excludedProducts.length > 0) {
        const hasExcludedProduct = cartItems.some(item =>
            coupon.excludedProducts.some(productId =>
                productId.toString() === item.productId.toString()
            )
        );
        if (hasExcludedProduct) {
            return { valid: false, message: "Coupon cannot be applied due to excluded products in cart" };
        }
    }

    if (coupon.excludedCategories.length > 0) {
        const hasExcludedCategory = cartItems.some(item =>
            coupon.excludedCategories.includes(item.category)
        );
        if (hasExcludedCategory) {
            return { valid: false, message: "Coupon cannot be applied due to excluded product categories in cart" };
        }
    }

    return { valid: true };
}