import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import connectToDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import Product from "@/models/Product";
import Category from "@/models/Category";

// GET - Get single product details (Seller only)
export async function GET(request, { params }) {
    try {
        const { userId } = getAuth(request);
        const isSeller = await authSeller(userId);

        if (!isSeller) {
            return NextResponse.json(
                { success: false, message: "Not Authorized" },
                { status: 401 }
            );
        }

        await connectToDB();
        const productId = params.id;

        const product = await Product.findById(productId)
            .populate('categoryId', 'name')
            .lean();

        if (!product) {
            return NextResponse.json(
                { success: false, message: "Product not found" },
                { status: 404 }
            );
        }

        // Check if the product belongs to the authenticated seller
        if (product.userId !== userId) {
            return NextResponse.json(
                { success: false, message: "Access denied - not your product" },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            product
        });

    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// PUT - Update product (Seller only)
export async function PUT(request, { params }) {
    try {
        const { userId } = getAuth(request);
        const isSeller = await authSeller(userId);

        if (!isSeller) {
            return NextResponse.json(
                { success: false, message: "Not Authorized" },
                { status: 401 }
            );
        }

        await connectToDB();
        const productId = params.id;
        const updateData = await request.json();

        // Check if product exists and belongs to seller
        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            return NextResponse.json(
                { success: false, message: "Product not found" },
                { status: 404 }
            );
        }

        if (existingProduct.userId !== userId) {
            return NextResponse.json(
                { success: false, message: "Access denied - not your product" },
                { status: 403 }
            );
        }

        // Validate required fields
        if (updateData.name && updateData.name.trim().length === 0) {
            return NextResponse.json(
                { success: false, message: "Product name is required" },
                { status: 400 }
            );
        }

        if (updateData.price && updateData.price <= 0) {
            return NextResponse.json(
                { success: false, message: "Price must be greater than 0" },
                { status: 400 }
            );
        }

        if (updateData.quantity && updateData.quantity < 0) {
            return NextResponse.json(
                { success: false, message: "Quantity cannot be negative" },
                { status: 400 }
            );
        }

        // Validate category if being updated
        if (updateData.categoryId) {
            const categoryExists = await Category.findById(updateData.categoryId);
            if (!categoryExists) {
                return NextResponse.json(
                    { success: false, message: "Invalid category selected" },
                    { status: 400 }
                );
            }
            updateData.category = categoryExists.name;
        }

        // Calculate discounted price if discount percent is provided
        if (updateData.discountPercent !== undefined) {
            if (updateData.discountPercent < 0 || updateData.discountPercent > 100) {
                return NextResponse.json(
                    { success: false, message: "Discount percent must be between 0-100" },
                    { status: 400 }
                );
            }

            const basePrice = updateData.price || existingProduct.price;
            updateData.discountedPrice = updateData.discountPercent > 0
                ? basePrice - (basePrice * updateData.discountPercent / 100)
                : 0;
        }

        // Validate rating if being updated
        if (updateData.rating !== undefined && (updateData.rating < 0 || updateData.rating > 5)) {
            return NextResponse.json(
                { success: false, message: "Rating must be between 0-5" },
                { status: 400 }
            );
        }

        // Validate boolean fields
        const booleanFields = ['isFeatured', 'isActive', 'isTrending', 'isNewArrival'];
        booleanFields.forEach(field => {
            if (updateData[field] !== undefined && typeof updateData[field] !== 'boolean') {
                updateData[field] = Boolean(updateData[field]);
            }
        });

        // Update the product
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { ...updateData, updatedAt: Date.now() },
            { new: true, runValidators: true }
        ).populate('categoryId', 'name');

        return NextResponse.json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// DELETE - Delete product (Seller only)
export async function DELETE(request, { params }) {
    try {
        const { userId } = getAuth(request);
        const isSeller = await authSeller(userId);

        if (!isSeller) {
            return NextResponse.json(
                { success: false, message: "Not Authorized" },
                { status: 401 }
            );
        }

        await connectToDB();
        const productId = params.id;

        // Check if product exists and belongs to seller
        const product = await Product.findById(productId);
        if (!product) {
            return NextResponse.json(
                { success: false, message: "Product not found" },
                { status: 404 }
            );
        }

        if (product.userId !== userId) {
            return NextResponse.json(
                { success: false, message: "Access denied - not your product" },
                { status: 403 }
            );
        }

        // If product has sales, deactivate instead of deleting
        if (product.salesCount > 0) {
            await Product.findByIdAndUpdate(productId, { isActive: false });
            return NextResponse.json({
                success: true,
                message: "Product deactivated (cannot delete products with sales history)"
            });
        }

        // Delete the product
        await Product.findByIdAndDelete(productId);

        return NextResponse.json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}