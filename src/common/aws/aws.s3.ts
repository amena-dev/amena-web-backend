import * as aws from 'aws-sdk'

export class S3 {
    config: object
    bucketName: aws.S3.BucketName
    bucket: aws.S3

    constructor(bucketName) {
        this.bucketName = bucketName
        this.bucket = new aws.S3({ params: { Bucket: this.bucketName } });
    }

    putImage = async (key: string, base64Image: string, putOptions = {}): Promise<aws.S3.PutObjectOutput> => {
        const buf = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ""), 'base64')
        const s3Object: aws.S3.PutObjectRequest = Object.assign({
            Bucket: this.bucketName,
            Key: key,
            Body: buf,
            ContentEncoding: 'base64',
            ContentType: 'image/jpeg'
        }, putOptions)

        return new Promise((resolve, reject) => {
            this.bucket.putObject(s3Object, (err, data) => {
                if(err) reject(err)
                else resolve(data)
            })
        })
    }

    listObjects = async (objectPrefix: string, findOptions = {}): Promise<aws.S3.ListObjectsOutput> => {
        const params = Object.assign({
            Bucket: this.bucketName,
            Prefix: objectPrefix
        }, findOptions)

        return new Promise((resolve, reject) => {
            this.bucket.listObjects(params, (err, data) => {
                if(err) reject(err)
                else resolve(data)
            })
        })
    }

    getSignedUrl = async (key: string, expires: number = 60 * 15): Promise<string> => {
        const params = {
            Bucket: this.bucketName,
            Key: key,
            Expires: expires
        }

        return new Promise((resolve, reject) => {
            this.bucket.getSignedUrl("getObject", params, (err, url) => {
                if(err) reject(err)
                else resolve(url)
            })
        })
    }

    getBucket = async (): Promise<aws.S3> => {
        return this.bucket
    }

    deleteObject = async (objectKey: string): Promise<aws.S3.DeleteObjectOutput> => {
        const params = {
            Bucket: this.bucketName,
            Key: objectKey
        }

        return new Promise((resolve, reject) => {
            this.bucket.deleteObject(params, (err, data) => {
                if(err) reject(err)
                else resolve(data)
            })
        })
    }
}