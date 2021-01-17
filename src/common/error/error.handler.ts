import * as fastify from 'fastify';
import { FastifyError } from 'fastify';
import { ErrorResponse } from '../interfaces/interface.response';
import * as ErrorClasses from './error.class';

export class ErrorHandler {
    constructor() { }

    public async handler(error: Error, req: fastify.FastifyRequest, reply: fastify.FastifyReply): Promise<ErrorResponse> {
        console.error(error)

        switch (error.constructor) {
            case ErrorClasses.UnauthorizedException:
                reply.status(401)
                break;
            case ErrorClasses.BadrequestException:
                reply.status(400)
                break;
            case ErrorClasses.TooManyRequestsException:
                reply.status(429)
                break;
            default:
                if (error.name === "FastifyError") {
                    reply.status(error["statusCode"])
                }else{
                    reply.status(500)
                    return { message: "Internal server error." }
                }
                break;
        }

        return {
            message: error.message
        }
    }
}