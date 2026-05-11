import { createServer } from "http";

import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { createSocketServer } from "./sockets/server";

const app = createApp();
const httpServer = createServer(app);
const io = createSocketServer(httpServer);

app.set("io", io);

httpServer.listen(env.PORT, () => {
  logger.info(`CAMPUS-BANDHU API listening on port ${env.PORT}`);
});
