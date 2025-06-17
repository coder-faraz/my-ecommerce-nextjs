import mongoose from "mongoose";

// Global cache object to avoid multiple connections in development or hot-reload scenarios
let cached = global.mongoose;

// Initialize the global cache if it doesn't exist already
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null }
}

/**
 * Establishes a connection to the MongoDB database using Mongoose.
 *
 * This function implements a singleton pattern to ensure that:
 * - Only one database connection is created across multiple API calls or serverless invocations.
 * - Connection reuse is handled efficiently with a global `cached` object.
 *
 * It returns an existing connection if available,
 * otherwise it establishes a new one and caches it.
 *
 * @returns {Promise<typeof mongoose>} The connected mongoose instance
 */
async function connectToDB() {
    // If a cached connection exists, return it
    if (cached.conn) {
        return cached.conn;
    }

    // If no connection promise exists, create one
    if (!cached.promise) {
        const options = {
            bufferCommands: false
        }
        // Initiate a new connection and store the promise
        cached.promise = mongoose.connect(process.env.MONGODB_URI, options)
            .then(mongoose => {
                return mongoose;
            })
    }
    // Await and store the resolved connection
    cached.conn = await cached.promise;
    return cached.conn;
}

export default connectToDB;
