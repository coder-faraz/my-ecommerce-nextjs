import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        firstname: { type: String, required: true },
        lastname: { type: String },
        email: { type: String, required: true, unique: true },
        imageUrl: { type: String },
        cartItems: { type: Object, default: {} },
    },
    { minimize: false }
);

const User =
    mongoose.models.user || mongoose.model("user", userSchema);

export default User;
