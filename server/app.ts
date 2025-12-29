import express from "express";
import { registerRoutes } from "./routes";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

app.use(
    express.json({
        limit: "50mb",
        verify: (req, _res, buf) => {
            (req as any).rawBody = buf;
        },
    }),
);

app.use(express.urlencoded({ extended: false, limit: "50mb" }));

// This function sets up the app but doesn't listen
// We need to await registerRoutes because it might be async
export async function setupApp() {
    await registerRoutes(httpServer, app);
    return app;
}

export { app, httpServer };
