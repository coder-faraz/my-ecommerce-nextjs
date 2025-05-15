import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null }
}

async function connectToDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const options = {
            bufferCommands: false
        }
        cached.promise = mongoose.connect(`${process.env.MONGODB_URI}/my-ecommerce`, options)
            .then(mongoose => {
                return mongoose;
            })
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

export default connectToDB;
