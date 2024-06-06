import express from 'express';
import {Express} from 'express-serve-static-core';

import * as OpenApiValidator from 'express-openapi-validator';
import {connector, summarise} from 'swagger-routes-express';
import YAML from 'yamljs'

import * as api from '../api/controllers'

export async function createServer():Promise<Express> {


// Load API specification.
const yamlSpecFile = './config/openapi.yml';
const apiDefinition = YAML.load(yamlSpecFile);
const apiSummary = summarise(apiDefinition);

console.info('Loaded API specifications: ', apiSummary)


const server = express();


// Setup API validator
const validatorOptions = {
    coerceType: true,
    apiSpec: yamlSpecFile,
    validateRequests: true,
    validateResponses: true
}

// Configure server to use the validator as middleware
server.use(OpenApiValidator.middleware(validatorOptions))

// Error customization, if request is invalid.

server.use((err:any, req: express.Request, res: express.Response, next: express.NextFunction)=>{
    res.status(err.status).json({
        error:{
            type: 'request_validation',
            message: err.message,
            errors: err.errors
        }
    })
})


const connect = connector(api, apiDefinition, {
    onCreateRoute: (method: string, descriptor: any[])=>{
        descriptor.shift()
        console.log(`${method}: ${descriptor.map((d: any) => d.name).join(', ')}`)
    },
    security:{
        bearerAuth: api.auth,
    }
})


connect(server);
return server;
}