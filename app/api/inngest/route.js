import { serve } from "inngest/next";
import { inngest, syncUserCreation, syncUserDeletion, syncUserUpdation, userOrderCreation } from "@/config/inngest";

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        userOrderCreation,
        syncUserCreation,
        syncUserUpdation,
        syncUserDeletion
    ],
});
