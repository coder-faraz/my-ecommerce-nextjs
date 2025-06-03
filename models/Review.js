import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true
    },
    userId: {
        type: String,
        ref: 'user',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true,
        maxlength: 1000
    },
}, {
    timestamps: true
});

// Create compound index to prevent duplicate reviews from same user for same product
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

const Review = mongoose.models.review || mongoose.model('review', reviewSchema);

export default Review;
