import express from "express";
import { registerRoutes } from "./routes";
import { createServer } from "http";

const app = express();

app.use(
    express.json({
        limit: "50mb",
        verify: (req, _res, buf) => {
            (req as any).rawBody = buf;
        },
    }),
);

app.use(express.urlencoded({ extended: false, limit: "50mb" }));

// For serverless (Netlify/Vercel) - just setup routes without HTTP server
export async function setupApp() {
    // Create a minimal server just for registerRoutes compatibility
    const httpServer = createServer(app);
    await registerRoutes(httpServer, app);
    return app;
}

// For traditional server (local dev)
export async function setupAppWithServer() {
    const httpServer = createServer(app);
    await registerRoutes(httpServer, app);
    return { app, httpServer };
}

export { app };
