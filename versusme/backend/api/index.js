import serverlessExpress from "@vendia/serverless-express";
import app from "../src/server.js";

export const handler = serverlessExpress({ app });
