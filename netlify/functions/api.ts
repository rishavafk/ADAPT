import serverless from "serverless-http";
import { setupApp } from "../../server/app";

let cachedHandler: any;

exports.handler = async (event: any, context: any) => {
    try {
        if (!cachedHandler) {
            console.log("Initializing Express app for Netlify...");
            const app = await setupApp();
            cachedHandler = serverless(app);
            console.log("Express app initialized successfully");
        }
        return await cachedHandler(event, context);
    } catch (error) {
        console.error("Netlify function error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal server error",
                error: error instanceof Error ? error.message : String(error)
            })
        };
    }
};
