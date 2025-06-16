import { Inngest } from "inngest";

import connectToDB from "./db";
import User from "@/models/User";
import Product from "@/models/Product";
import Order from "@/models/Order";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "my-ecommerce" });

// Inngest function to save user data to db
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

// Inngest function to update user data to db
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

// Inngest function to delete user data to db
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

// Inngest function to create user order in db
/**
 * Listens for up to 5 `order/created` events (3s timeout),
 * then writes them as Order documents in one batch.
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