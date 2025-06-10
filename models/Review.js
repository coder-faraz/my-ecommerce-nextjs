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
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvedBy: {
        type: String,
        ref: 'user',
        default: null
    },
    approvedAt: {
        type: Date,
        default: null
    },
    rejectionReason: {
        type: String,
        default: null
    },
},
    {
        timestamps: true
    }
);

// Partial unique index: only one non-rejected review per user per product
reviewSchema.index(
    { productId: 1, userId: 1 },
    {
        unique: true,
        partialFilterExpression: { status: { $ne: 'rejected' } }
    }
);
reviewSchema.index({ status: 1, createdAt: -1 });

const Review = mongoose.models.review || mongoose.model('review', reviewSchema);

export default Review;
