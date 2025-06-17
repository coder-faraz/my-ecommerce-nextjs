import { Inngest } from "inngest";

import connectToDB from "./db";
import User from "@/models/User";
import Product from "@/models/Product";
import Order from "@/models/Order";

/**
 * Initialize an Inngest client for your e-commerce application.
 * This client will be used to create and handle event-driven functions.
 */
export const inngest = new Inngest({ id: "my-ecommerce" });

/**
 * Syncs a newly created Clerk user to the MongoDB database.
 *
 * Triggered by the event: `clerk/user.created`
 * - Extracts relevant user details from the event payload.
 * - Connects to MongoDB.
 * - Creates a new `User` document in the database.
 */
export const syncUserCreation = inngest.createFunction(
    {
        id: "create-user-from-clerk"
    },
    {
        event: "clerk/user.created"
    },
    async ({ event }) => {
        const { id, first_name, last_name, image_url, email_addresses } = event.data;
        const userData = {
            _id: id,
            name: first_name + ' ' + last_name,
            email: email_addresses[0].email_address,
            imageUrl: image_url
        };
        await connectToDB();
        await User.create(userData);
    }
);

/**
 * Updates a user's data in the MongoDB database when the user is updated in Clerk.
 *
 * Triggered by the event: `clerk/user.updated`
 * - Extracts updated user data from the event.
 * - Connects to MongoDB.
 * - Updates the existing `User` document using `findByIdAndUpdate`.
 */
export const syncUserUpdation = inngest.createFunction(
    {
        id: "update-user-from-clerk"
    },
    {
        event: "clerk/user.updated"
    },
    async ({ event }) => {
        const { id, first_name, last_name, image_url, email_addresses } = event.data;
        const userData = {
            _id: id,
            name: first_name + ' ' + last_name,
            email: email_addresses[0].email_address,
            imageUrl: image_url
        };
        await connectToDB();
        await User.findByIdAndUpdate(id, userData);
    }
);

/**
 * Deletes a user's data from MongoDB when the user is removed from Clerk.
 *
 * Triggered by the event: `clerk/user.deleted`
 * - Connects to MongoDB.
 * - Deletes the user record by ID.
 */
export const syncUserDeletion = inngest.createFunction(
    {
        id: "delete-user-from-clerk"
    },
    {
        event: "clerk/user.deleted"
    },
    async ({ event }) => {
        const { id } = event.data;
        await connectToDB();
        await User.findByIdAndDelete(id);
    }
);

/**
 * Handles order creation in bulk by processing up to 5 `order/created` events at a time.
 *
 * Triggered by the event: `order/created`
 * Batched with:
 * - `maxSize`: 5 events
 * - `timeout`: 3 seconds
 *
 * Responsibilities:
 * - Insert orders into MongoDB using `insertMany`.
 * - Update product inventory (reduce stock) and increment sales count accordingly.
 */
export const userOrderCreation = inngest.createFunction(
    {
        id: "create-user-order",
        batchEvents: {
            maxSize: 5,
            timeout: '3s'
        }
    },
    {
        event: "order/created"
    },
    async ({ events }) => {
        // 1) Map incoming events to Order.create payloads
        const orders = events.map((e) => {
            const {
                userId,
                addressId,
                promoCode,
                items,
                itemsCount,
                itemsTotal,
                shippingFee,
                taxPercent,
                taxAmount,
                discountAmount,
                totalAmount
            } = e.data;

            return {
                userId,
                items,
                shippingAddress: addressId,
                promoCode,
                itemsCount,
                itemsTotal,
                shippingFee,
                taxPercent,
                taxAmount,
                discountAmount,
                totalAmount
            };
        });

        // 2) Connect and insertMany in one go
        await connectToDB();
        await Order.insertMany(orders);

        // 3) Update product inventory and sales count for each ordered item
        for (const e of events) {
            for (const { productId, quantity } of e.data.items) {
                // Subtract ordered quantity from product stock AND increment sales count
                await Product.findByIdAndUpdate(
                    productId,
                    {
                        $inc: {
                            quantity: -quantity,     // Decrease inventory
                            salesCount: quantity     // Increase sales count by sold quantity
                        }
                    },
                    { new: true }
                );
            }
        }
        return {
            success: true,
            processed: orders.length
        };
    }
);