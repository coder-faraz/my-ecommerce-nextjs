import { serve } from "inngest/next";
import { inngest, syncUserCreation, syncUserDeletion, syncUserUpdation, userOrderCreation } from "@/config/inngest";

/**
 * Inngest Route Handler
 * 
 * This file sets up the event-driven API route using Inngest for handling background tasks and automation
 * such as syncing user data and processing orders.
 *
 * The `serve` function generates handlers (GET, POST, PUT) to handle incoming webhook events
 * sent by Inngest to execute the registered serverless functions.
 * 
 * @returns {GET, POST, PUT} - HTTP handlers for the route, ready to handle webhook events.
 * 
 * Registered Functions:
 * - `syncUserCreation`: Handles Clerk `user.created` events to sync new users to MongoDB.
 * - `syncUserUpdation`: Handles Clerk `user.updated` events to update user details.
 * - `syncUserDeletion`: Handles Clerk `user.deleted` events to remove user records.
 * - `userOrderCreation`: Handles batched `order/created` events to:
 *      - Create new order records in the DB
 *      - Decrease inventory stock
 *      - Increase sales count per product
 */
export const { GET, POST, PUT } = serve({
    client: inngest,    // Inngest client instance initialized with app ID
    functions: [
        userOrderCreation,
        syncUserCreation,
        syncUserUpdation,
        syncUserDeletion
    ],
});
