import express from "express";
import { Express } from "express-serve-static-core";

import * as OpenApiValidator from "express-openapi-validator";
import { connector, summarise } from "swagger-routes-express";
import YAML from "yamljs";

import * as api from "@vivek/api/controllers";

import bodyParser from "body-parser";

import morgan from "morgan";
import morganBody from "morgan-body";
import { expressDevLogger } from "@vivek/utils/express_dev_logger";

import config from "@vivek/config";
import logger from "./logger";

export async function createServer(): Promise<Express> {
  // Load API specification.
  const yamlSpecFile = "./config/openapi.yml";
  const apiDefinition = YAML.load(yamlSpecFile);
  const apiSummary = summarise(apiDefinition);

  logger.info("Loaded API specifications: ", apiSummary);

  const server = express();

  // Setup API validator
  const validatorOptions = {
    coerceType: true,
    apiSpec: yamlSpecFile,
    validateRequests: true,
    validateResponses: true,
  };

  // Configure server to use the validator as middleware
  server.use(OpenApiValidator.middleware(validatorOptions));

  // Use Custom logger
  server.use(bodyParser.json());

  if (config.morganLogger) {
    server.use(
      morgan(":method :url :status :response-time ms - :res[content-length]")
    );
  }
  if (config.morganBodyLogger) {
    morganBody(server);
  }

  if (config.exmplDevLogger) {
    server.use(expressDevLogger);
  }

  // Error customization, if request is invalid.

  server.use(
    (
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      res.status(err.status).json({
        error: {
          type: "request_validation",
          message: err.message,
          errors: err.errors,
        },
      });
    }
  );

  const connect = connector(api, apiDefinition, {
    onCreateRoute: (method: string, descriptor: any[]) => {
      descriptor.shift();
      logger.verbose(
        `${method}: ${descriptor.map((d: any) => d.name).join(", ")}`
      );
    },
    security: {
      bearerAuth: api.auth,
    },
  });

  connect(server);
  return server;
}
