const pjson = require('../../package.json');
import { Config } from '../common/config/config'
import * as aws from 'aws-sdk'

export class VersionRoutes {
    initRoutes(server: any, opts: any, next: any): void {
        server.get('/version', (req: any, reply: any) => {
            reply.header('Content-Type', 'application/json').code(200);
            reply.send({ version: pjson.version });
        });
        next();
    }
}