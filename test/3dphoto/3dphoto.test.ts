import fastify from 'fastify'
import { FastifyRequest } from 'fastify'
import fastifyCors from 'fastify-cors'
import { TDPhotoService } from '../../src/3dphoto/3dphoto.service'
import { Authorization } from '../../src/common/authorization/authorization'
import { S3 } from '../../src/common/aws/aws.s3'
import { SQS } from '../../src/common/aws/aws.sqs'
import * as aws from 'aws-sdk'

const target = new TDPhotoService()

describe("3D Photograph", () => {
    const test_account_id = "test-id"
    const test_account_token = "test-token"
    const test_header = { authorization: `Bearer ${test_account_token}` }
    jest.spyOn(target.authorization, 'auth').mockReturnValue(new Promise(res => {res(test_account_id)}))

    it("add 3dphoto input.", async () => {
        const test_image = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gAfQ29tcHJlc3NlZCBieSBqcGVnLXJlY29tcHJlc3P/2wCEAA0NDQ0ODQ4QEA4UFhMWFB4bGRkbHi0gIiAiIC1EKjIqKjIqRDxJOzc7STxsVUtLVWx9aWNpfZeHh5e+tb75+f8BDQ0NDQ4NDhAQDhQWExYUHhsZGRseLSAiICIgLUQqMioqMipEPEk7NztJPGxVS0tVbH1pY2l9l4eHl761vvn5///CABEIAA0ADgMBIgACEQEDEQH/xAAVAAEBAAAAAAAAAAAAAAAAAAAAB//aAAgBAQAAAACnD//EABQBAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIQAAAAf//EABQBAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMQAAAAf//EABQQAQAAAAAAAAAAAAAAAAAAACD/2gAIAQEAAT8AH//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Af//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Af//Z"
        const test_message_id = "test-message-id"
        const test_put_input = {MessageId: test_message_id}
        const test_queue_size = 0

        jest.spyOn(target.inputBucket, 'putImage').mockReturnValue(null);
        jest.spyOn(target.queue, 'getQueueSize').mockReturnValue(new Promise(res => {res(test_queue_size)}))
        jest.spyOn(target.queue, 'putJson').mockReturnValue(new Promise(res => {res(test_put_input)}))

        const req = {
            body: { base64: test_image },
            headers: test_header
        }

        await target.add3dphotoInput(req as FastifyRequest)
    })

    it("get 3dphoto input.", async () => {
        const test_signed_url = "test-signed-url"
        const test_s3_object_key = "test-object-key"
        const test_last_modified_date = new Date()
        const test_input_list_objects = {Contents: [{
            Key: `/${test_s3_object_key}`,
            LastModified: test_last_modified_date
        }]}

        jest.spyOn(target.inputBucket, 'listObjects').mockReturnValue(new Promise(res => {res(test_input_list_objects)}) as Promise<aws.S3.ListObjectsOutput>);
        jest.spyOn(target.inputBucket, 'getSignedUrl').mockReturnValue(new Promise(res => {res(test_signed_url)}));
        jest.spyOn(target.inputBucket, 'deleteObject').mockReturnValue(null);

        const req = {
            headers: test_header
        }

        const result = (await target.get3dphotoInput({} as FastifyRequest)).results[0]

        console.log("result:")
        console.log(result)

        expect(result.id).toBe(test_s3_object_key)
        expect(result.url).toBe(test_signed_url)
        expect(result.requested_at).toBe(test_last_modified_date.getTime())
    })

    it("delete 3dphoto input.", async () => {
        const test_input_id = "test-input-id"

        const req = {
            query: {
                id: test_input_id
            }
        }

        await target.delete3dphotoInput(req as FastifyRequest)
    })

    it("get 3dphoto output.", async () => {
        const test_s3_object_key = "test-object-key"
        const test_signed_url = "test-signed-url"
        const test_output_list_objects = {Contents: [{
            Key: `/${test_s3_object_key}`,
        }]}

        jest.spyOn(target.outputBucket, 'getSignedUrl').mockReturnValue(new Promise(res => {res(test_signed_url)}));
        jest.spyOn(target.outputBucket, 'listObjects').mockReturnValue(new Promise(res => {res(test_output_list_objects)}) as Promise<aws.S3.ListObjectsOutput>);

        const req = {
            headers: test_header
        }

        const result = (await target.get3dphotoOutput(req as FastifyRequest)).results[0]

        console.log("result:")
        console.log(result)

        expect(result.id).toBe(test_s3_object_key)
        expect(result.url).toBe(test_signed_url)
    })

})