import * as fastify from 'fastify';
import { TDPhotoService } from './3dphoto.service';
import { Get3DPhotoInputResponse, Get3DPhotoOutputResponse } from '../common/interfaces/interface.response';
import { Config } from '../common/config/config'
import { Authorization } from '../common/authorization/authorization';
import { S3 } from '../common/aws/aws.s3'
import { SQS } from '../common/aws/aws.sqs'
import * as aws from 'aws-sdk'
import { TooManyRequestsException } from '../common/error/error.class';

export class TDPhotoController {
    authorization: Authorization
    config: object
    bucket: S3
    queue: SQS
    service: TDPhotoService

    constructor() {
        this.authorization = new Authorization("google-client-id")
        this.config = new Config().get()
        this.bucket = new S3(this.config["aws"]["input_s3_bucket"])
        this.queue = new SQS(process.env["QUEUE_URL"])
        this.service = new TDPhotoService()
    }

    get3dphotoInputHandler = async (req: fastify.FastifyRequest, reply: fastify.FastifyReply): Promise<Get3DPhotoInputResponse> => {
        reply.status(200)
        return await this.service.get3dphotoInput(req)
    }

    post3dphotoInputHandler = async (req: fastify.FastifyRequest, reply: fastify.FastifyReply) => {
        reply.status(204)
        await this.service.add3dphotoInput(req)
    }

    delete3dphotoInputHandler = async (req: fastify.FastifyRequest, reply: fastify.FastifyReply) => {
        reply.status(204)
        await this.service.delete3dphotoInput(req)
    }

    get3dphotoOutputHandler = async (req: fastify.FastifyRequest, reply: fastify.FastifyReply): Promise<Get3DPhotoOutputResponse> => {
        reply.status(200)
        return await this.service.get3dphotoOutput(req)
    }
}