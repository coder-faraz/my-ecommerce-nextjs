import mongoose from 'mongoose';

const userCouponUsageSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    couponId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'coupon',
        required: true
    },
    couponCode: {
        type: String,
        required: true,
        uppercase: true
    },
    usageCount: {
        type: Number,
        default: 0,
        min: 0
    },
    lastUsed: {
        type: Date,
        default: Date.now
    },
    ordersUsed: [{
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'order'
        },
        usedAt: {
            type: Date,
            default: Date.now
        },
        discountAmount: Number
    }],
},
    {
        timestamps: true
    });

// Compound index for efficient queries
userCouponUsageSchema.index({ userId: 1, couponId: 1 }, { unique: true });
userCouponUsageSchema.index({ userId: 1, couponCode: 1 });

const UserCouponUsage = mongoose.models.userCouponUsage || mongoose.model('userCouponUsage', userCouponUsageSchema);

export default UserCouponUsage;
