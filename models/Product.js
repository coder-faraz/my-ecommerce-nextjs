import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true, ref: 'user' },
        name: { type: String, required: true },
        brand: { type: String, required: true },
        category: { type: String, required: true },
        categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'category', required: true },
        color: { type: String, default: '' },
        description: { type: String, default: '' },
        price: { type: Number, required: true },
        discountPercent: { type: Number, default: 0 },
        discountedPrice: { type: Number, default: 0 },
        quantity: { type: Number, default: 0 },
        images: [{ type: String }],
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        reviewCount: {
            type: Number,
            default: 0
        },
        salesCount: {
            type: Number,
            default: 0,
            min: 0
        },
        isFeatured: {
            type: Boolean,
            default: false
        },
        isActive: {
            type: Boolean,
            default: true
        },
        isTrending: {
            type: Boolean,
            default: false
        },
        isNewArrival: {
            type: Boolean,
            default: false
        }
    },
    {
        minimize: false,
        timestamps: true
    }
);

// Index for better query performance
productSchema.index({ categoryId: 1, price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ salesCount: -1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isNewArrival: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ name: 'text', description: 'text' });

// Virtual field to determine if product is "latest" (created within last 30 days)
productSchema.virtual('isLatest').get(function () {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return this.createdAt > thirtyDaysAgo;
});

// Virtual field to determine if product is "top rated" (rating >= 4)
productSchema.virtual('isTopRated').get(function () {
    return this.rating >= 4 && this.reviewCount > 0;
});

// Virtual field to determine if product is "best selling" (salesCount >= 50)
productSchema.virtual('isBestSelling').get(function () {
    return this.salesCount >= 50;
});

const Product = mongoose.models.product || mongoose.model("product", productSchema);

export default Product;
