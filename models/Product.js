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
productSchema.index({ name: 'text', description: 'text' });

const Product =
    mongoose.models.product || mongoose.model("product", productSchema);

export default Product;
