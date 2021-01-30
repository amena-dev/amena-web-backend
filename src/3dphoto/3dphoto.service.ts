import * as fastify from 'fastify';
import { BadrequestException, TooManyRequestsException } from '../common/error/error.class'
import { Config } from '../common/config/config'
import Jimp from 'jimp';
import { Authorization } from '../common/authorization/authorization';
import { S3 } from '../common/aws/aws.s3';
import { SQS } from '../common/aws/aws.sqs';
import { Get3DPhotoInputElementResponse, Get3DPhotoInputResponse, Get3DPhotoOutputElementResponse, Get3DPhotoOutputResponse } from '../common/interfaces/interface.response'

export class TDPhotoService {
    authorization: Authorization
    config: object
    inputBucket: S3
    outputBucket: S3
    queue: SQS
    service: TDPhotoService
    engineType: string

    constructor() {
        this.authorization = new Authorization(process.env["AMENA_GOOGLE_CLIENT_ID"])
        this.config = new Config().get()
        this.inputBucket = new S3(this.config["aws"]["input_s3_bucket"])
        this.outputBucket = new S3(this.config["aws"]["output_s3_bucket"])
        this.queue = new SQS(process.env["QUEUE_URL"])
        this.engineType = "3dphoto"
    }

    add3dphotoInput = async (req: fastify.FastifyRequest) => {
        // Verify the token.
        const accountId = await this.authorization.auth(req)
        const userInputs = await this.inputBucket.listObjects(`${accountId}/`)
        const limitPerUser = parseInt(this.config["app"]["limit_of_input_per_user"])
        const limitPerSystem = parseInt(this.config["app"]["limit_of_input_per_system"])

        // Verify the limit of inputs.
        if(userInputs.Contents.length >= limitPerUser)
            throw new TooManyRequestsException(`The number of inputs per user limit(${limitPerUser}inputs) has been exceeded.`)
        else if(await this.queue.getQueueSize() >= limitPerSystem)
            throw new TooManyRequestsException(`The server is crowded. Please wait for a while and try again.`)

        // Verify the image data format.
        const image = req.body["base64"]
        await this.checkBase64ImageValidation(image)

        // Enqueue to SQS
        const enqueued = await this.queue.putJson({
            account_id: accountId,
            type: this.engineType
        }, {
            DelaySeconds: this.config["aws"]["sqs_delay_sec"]
        })

        // Save the image to the input bucket in S3.
        const putKey = this.config["aws"]["input_image_path"]
            .replace("{account_id}", accountId)
            .replace("{input_id}", enqueued.MessageId)

        await this.inputBucket.putImage(putKey, image)
    }

    get3dphotoInput = async (req: fastify.FastifyRequest): Promise<Get3DPhotoInputResponse> => {
        // Verify the token.
        const accountId: string = await this.authorization.auth(req)

        // Search s3 input bucket by google account id token
        const userInputs = await this.inputBucket.listObjects(`${accountId}/`)
        let results: Array<Get3DPhotoInputElementResponse> = []

        // Create an s3 signed URL for the target input images
        for(let input of userInputs.Contents) {
            const input_id: string = input.Key.split("/")[1]

            results.push({
                id: input_id,
                url: await this.inputBucket.getSignedUrl(input.Key),
                requested_at: input.LastModified.getTime()
            })
        }

        return {
            "results": results
        }
    }

    delete3dphotoInput = async (req: fastify.FastifyRequest) => {
        // Verify the token.
        const accountId: string = await this.authorization.auth(req)
        const inputId: string = req.query["id"]
        if(!inputId) throw new BadrequestException("Required input id query.")

        // Delete the target image from the input image bucket in S3.
        const objectKey: string = this.config["aws"]["input_image_path"]
            .replace("{account_id}", accountId)
            .replace("{input_id}", inputId)

        await this.inputBucket.deleteObject(objectKey)
    }

    get3dphotoOutput = async (req: fastify.FastifyRequest): Promise<Get3DPhotoOutputResponse> => {
        // Verify the token.
        const accountId: string = await this.authorization.auth(req)

        // Search s3 output bucket by google account id token
        const outputs = await this.outputBucket.listObjects(`${accountId}/`)
        let results: Array<Get3DPhotoOutputElementResponse> = []

        // Create an s3 signed URL for the target output images.
        for(let output of outputs.Contents) {
            const input_id: string = output.Key.split("/")[1]

            results.push({
                id: input_id,
                url: await this.inputBucket.getSignedUrl(output.Key)
            })
        }

        return {
            "results": results
        }
    }

    private async checkBase64ImageValidation(base64: string) {
        const buf: Buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64')
        await this.checkImageValidation(buf)
    }

    private async checkImageValidation(image: Buffer) {
        const jimpImage: Jimp = await Jimp.read(image)
        const limitY: Number = parseInt(this.config["app"]["input_image_limit_y"])
        const limitX: Number = parseInt(this.config["app"]["input_image_limit_x"])

        if (jimpImage.bitmap.width <= 0 || jimpImage.bitmap.height <= 0)
            throw new BadrequestException("Requested image is empty.")
        else if (jimpImage.getMIME() !== "image/jpeg")
            throw new BadrequestException("Invalid image mine, expected: image/jpeg.")
        else if (jimpImage.bitmap.width > limitX || jimpImage.bitmap.height > limitY)
            throw new BadrequestException(`Image size must be within ${limitX}x${limitY}.`)
    }
}