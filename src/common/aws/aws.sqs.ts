import * as aws from 'aws-sdk'

export class SQS {
    config: object
    queue_url: string
    queue: aws.SQS

    constructor(queue_url) {
        this.queue_url = queue_url
        this.queue = new aws.SQS()
    }

    putJson = async (putObject: object): Promise<aws.SQS.SendMessageResult> => {
        const params = {
            MessageBody: JSON.stringify(putObject),
            QueueUrl: this.queue_url
        }

        return new Promise((resolve, reject) => {
            this.queue.sendMessage(params, (err, data) => {
                if (err) reject(err)
                else resolve(data)
            })
        })
    }

    getQeueue = async (): Promise<aws.SQS> => {
        return this.queue
    }

    deleteQueue = async (receiptHandle: string) => {
        const params:aws.SQS.DeleteMessageRequest = {
            QueueUrl: this.queue_url,
            ReceiptHandle: receiptHandle
        }

        return new Promise((resolve, reject) => {
            this.queue.deleteMessage(params, (err, data) => {
                if(err) reject(err)
                else resolve(data)
            })
        })
    }

    getQueueSize = async (): Promise<Number> => {
        const params = {
            AttributeNames: ['ApproximateNumberOfMessages'],
            QueueUrl: this.queue_url
        }

        return new Promise((resolve, reject) => {
            this.queue.getQueueAttributes(params, (err, data) => {
                if (err) reject(err)
                else resolve(parseInt(data.Attributes.ApproximateNumberOfMessages))
            })
        })
    }
}