import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Checks whether a user has the "seller" role based on Clerk user metadata.
 *
 * @param {string} userId - The unique identifier of the user (Clerk ID).
 * @returns {Promise<boolean|NextResponse>} - Returns `true` if the user is a seller,
 *                                            `false` otherwise, or a JSON error response if an exception occurs.
 *
 * Process:
 * - Uses the Clerk server-side SDK to fetch the user by ID.
 * - Checks the user's `publicMetadata.role` to determine if they are a seller.
 * - If an error occurs (e.g., user not found), returns a JSON error response.
 */
const authSeller = async (userId) => {
    try {
        // Initialize the Clerk client
        const client = await clerkClient();

        // Fetch the user by ID from Clerk
        const user = await client.users.getUser(userId);

        // Check if the user's role is "seller" in public metadata
        if (user.publicMetadata.role === 'seller') {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        // Return a JSON error response in case of failure
        return NextResponse.json({ success: false, message: error.message });
    }
}

export default authSeller;
