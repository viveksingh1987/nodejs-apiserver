import { createServer } from "./utils/server";
import logger from "@vivek/utils/logger";

createServer()
  .then((server) =>
    server.listen(3000, () => logger.info("Listening on 30000"))
  )
  .catch((err) => logger.error);
