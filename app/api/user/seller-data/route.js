import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/express';
import authSeller from '@/lib/authSeller';

// Initialize Clerk Client
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// GET: Fetch all sellers (users with seller role in public metadata)
export async function GET(request) {
    try {
        // Extract the authenticated user’s ID from the request
        const { userId } = getAuth(request);
        if (!userId || !(await authSeller(userId))) {
            return NextResponse.json({ success: false, message: 'Not Authorized' }, { status: 401 });
        }

        // Fetch all users from Clerk
        const { data: users } = await clerkClient.users.getUserList();
        console.log(users, 'users in clerk seller')
        // Filter users with the seller role in their public metadata
        const sellers = users
            .filter((user) => user.publicMetadata?.role === 'seller')
            .map((user) => ({
                id: user.id,
                username: user.username,
                email: user.emailAddresses[0]?.emailAddress,
                createdAt: new Date(user.createdAt).toISOString(),
            }));

        return NextResponse.json({ success: true, sellers });
    } catch (error) {
        console.error(error, 'error in seller GET route');
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// POST: Add seller role to a user by email
export async function POST(request) {
    try {
        // Extract the authenticated user’s ID from the request
        const { userId } = getAuth(request);
        if (!userId || !(await authSeller(userId))) {
            return NextResponse.json({ success: false, message: 'Not Authorized' }, { status: 401 });
        }

        const { email } = await request.json();
        if (!email) {
            return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
        }

        // Find the user by email in Clerk
        const users = await clerkClient.users.getUserList({ emailAddress: [email] });
        const user = users.data[0];
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // Check if the user is already an seller
        if (user.publicMetadata?.role === 'seller') {
            return NextResponse.json({ success: false, message: 'User is already a seller' }, { status: 400 });
        }

        // Update the user's public metadata to add the seller role
        await clerkClient.users.updateUser(user.id, {
            publicMetadata: { ...user.publicMetadata, role: 'seller' },
        });

        return NextResponse.json({ success: true, message: 'seller role added', email });
    } catch (error) {
        console.error(error, 'error in seller POST route');
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// DELETE: Remove seller role from a user by email
export async function DELETE(request) {
    try {
        // Extract the authenticated user’s ID from the request
        const { userId } = getAuth(request);
        if (!userId || !(await authSeller(userId))) {
            return NextResponse.json({ success: false, message: 'Not Authorized' }, { status: 401 });
        }

        const { email } = await request.json();
        if (!email) {
            return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
        }

        // Find the user by email in Clerk
        const users = await clerkClient.users.getUserList({ emailAddress: [email] });
        const user = users.data[0];
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // Check if the user is an seller
        if (user.publicMetadata?.role === 'seller') {
            return NextResponse.json({ success: false, message: 'User is not a seller' }, { status: 400 });
        }

        // Update the user's public metadata to remove the seller role
        await clerkClient.users.updateUser(user.id, {
            publicMetadata: { ...user.publicMetadata, role: 'seller' },
        });

        return NextResponse.json({ success: true, message: 'seller role removed' });
    } catch (error) {
        console.error(error, 'error in seller DELETE route');
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}