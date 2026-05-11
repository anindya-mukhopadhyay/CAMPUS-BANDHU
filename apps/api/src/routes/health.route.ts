import { Router } from "express";

import { apiOk } from "../utils/api-response";

export const healthRouter = Router();

healthRouter.get("/health", (_request, response) => {
  response.json(
    apiOk({
      service: "campus-bandhu-api",
      status: "ok"
    })
  );
});
