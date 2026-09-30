import express from "express";
import { apiRouter } from "../src/api.js";

const app = express();

// Mount the API router both at root (in case Vercel strips /api) and at /api
app.use("/api", apiRouter);
app.use("/", apiRouter);

// Export as a serverless function
export default app;
