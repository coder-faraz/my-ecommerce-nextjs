import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    // Discount Configuration
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true,
        default: 'percentage'
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    maxDiscountAmount: {
        type: Number,
        min: 0
    },
    // Usage Limits
    usageLimit: {
        type: Number,
        min: 1,
        default: null
    }, // null means unlimited
    usageCount: {
        type: Number,
        default: 0,
        min: 0
    },
    userUsageLimit: {
        type: Number,
        min: 1
    }, // null means unlimited per user
    // Validity
    isActive: {
        type: Boolean,
        default: true
    },
    startDate: {
        type: Date,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    // Conditions
    minOrderAmount: {
        type: Number,
        min: 0
    },
    maxOrderAmount: {
        type: Number,
        min: 0
    },
    // Product/Category Restrictions
    applicableProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
    }],
    applicableCategories: [String],
    excludedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
    }],
    excludedCategories: [String],
    // User Restrictions
    applicableUsers: [String], // User IDs
    newUsersOnly: {
        type: Boolean,
        default: false
    },
    // Metadata
    createdBy: {
        type: String,
        required: true
    }
},
    {
        timestamps: true
    }
);

// Update the updatedAt field before saving
couponSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Validate dates
couponSchema.pre('save', function (next) {
    if (this.startDate >= this.expiryDate) {
        next(new Error('Start date must be before expiry date'));
    }
    if (this.minOrderAmount && this.maxOrderAmount && this.minOrderAmount >= this.maxOrderAmount) {
        next(new Error('Minimum order amount must be less than maximum order amount'));
    }
    next();
});

// Check if coupon is currently valid
couponSchema.methods.isValid = function () {
    const now = new Date();
    return this.isActive &&
        this.startDate <= now &&
        this.expiryDate > now &&
        (!this.usageLimit || this.usageCount < this.usageLimit);
};

// Calculate discount amount
couponSchema.methods.calculateDiscount = function (orderAmount) {
    if (!this.isValid()) return 0;

    if (this.minOrderAmount && orderAmount < this.minOrderAmount) return 0;
    if (this.maxOrderAmount && orderAmount > this.maxOrderAmount) return 0;

    let discount = 0;
    if (this.discountType === 'percentage') {
        discount = (orderAmount * this.discountValue) / 100;
        if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
            discount = this.maxDiscountAmount;
        }
    } else {
        discount = this.discountValue;
    }

    return Math.min(discount, orderAmount);
};

const Coupon = mongoose.models.coupon || mongoose.model('coupon', couponSchema);

export default Coupon;
