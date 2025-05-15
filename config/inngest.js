import { Inngest } from "inngest";
import connectToDB from "./db";
import User from "@/models/User";

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
            firstname: first_name,
            lastname: last_name,
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
            firstname: first_name,
            lastname: last_name,
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
