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
    },
    {
        minimize: false,
        timestamps: true
    }
);

const Product =
    mongoose.models.product || mongoose.model("product", productSchema);

export default Product;
