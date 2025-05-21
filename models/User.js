import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        username: { type: String },     // when manual account creation (using signup) then u get username
                                                    // but when login using Google then u get first_name & last_name & no username
        email: { type: String, required: true, unique: true },
        imageUrl: { type: String },
        cartItems: { type: Object, default: {} },
    },
    {
        minimize: false,
        timestamps: true
    }
);

const User =
    mongoose.models.user || mongoose.model("user", userSchema);

export default User;
