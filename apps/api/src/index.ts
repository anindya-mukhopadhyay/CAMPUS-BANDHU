import { createServer } from "http";

import { createApp } from "./app";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { createSocketServer } from "./sockets/server";

const app = createApp();
const httpServer = createServer(app);
const io = createSocketServer(httpServer);

app.set("io", io);

async function startServer() {
  await connectDatabase();
  
  httpServer.listen(env.PORT, () => {
    logger.info(`CAMPUS-BANDHU API listening on port ${env.PORT}`);
  });
}

startServer().catch((error) => {
  logger.error({ error }, "Fatal error starting server");
  process.exit(1);
});
