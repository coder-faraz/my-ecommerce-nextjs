import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },   // unit price at time of order
    quantity: { type: Number, required: true },
    subtotal: { type: Number, required: true }    // price * quantity
}, { _id: false });

const orderSchema = new mongoose.Schema(
    {
        /** Who placed it */
        userId: { type: String, ref: 'user', required: true },
        /** What was ordered */
        items: { type: [orderItemSchema], required: true, validate: items => items.length > 0 },
        /** Which address to ship to */
        shippingAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'address', required: true },
        promoCode: { type: String, default: '' },
        itemsCount: { type: Number, required: true },    // distinct items
        itemsTotal: { type: Number, required: true },    // sum of all subtotals
        shippingFee: { type: Number, required: true },    // e.g. 0 for free
        taxPercent: { type: Number, default: 0 },        // e.g. 2 for 2%
        taxAmount: { type: Number, required: true },
        discountAmount: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true },    // itemsTotal + shippingFee + taxAmount – discountAmount
        status: {
            type: String,
            enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
            default: 'Pending'
        },
        placedAt: { type: Date, default: Date.now },
        deliveredAt: { type: Date }
    },
    {
        timestamps: true,
        minimize: false
    }
);

const Order = mongoose.models.order || mongoose.model('order', orderSchema);

export default Order;
