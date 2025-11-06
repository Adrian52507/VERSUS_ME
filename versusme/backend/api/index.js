import serverlessExpress from "@vendia/serverless-express";
import app from "../server.js"; // importa tu app de Express

export const handler = serverlessExpress({ app });
