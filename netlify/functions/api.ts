import serverless from "serverless-http";
import { setupApp } from "../../server/app";

let handler: any;

export const api = async (event: any, context: any) => {
    if (!handler) {
        const app = await setupApp();
        handler = serverless(app);
    }
    return handler(event, context);
};
