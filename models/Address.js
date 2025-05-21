import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true, ref: 'user' },
        fullname: { type: String, required: true },
        contact: { type: String, required: true },
        alternativeContact: { type: String, default: '' },
        pincode: { type: Number, required: true },
        state: { type: String, required: true },
        city: { type: String, required: true },
        area: { type: String, required: true },
        landmark: { type: String, default: '' }
    },
    {
        minimize: false,
        timestamps: true
    }
);

const Address =
    mongoose.models.address || mongoose.model("address", addressSchema);

export default Address;
