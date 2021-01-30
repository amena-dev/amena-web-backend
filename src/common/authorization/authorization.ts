import verifier from 'google-id-token-verifier'
import * as fastify from 'fastify';
import { UnauthorizedException } from '../error/error.class'

export class Authorization {
    googleClientId: string

    constructor(googleClientId: string){
        this.googleClientId = googleClientId
    }

    // Get the user_id from auth header.
    public async auth(req: fastify.FastifyRequest): Promise<string> {
        if(!req.headers.authorization) {
            throw new UnauthorizedException()
        }else{
            const token: string = req.headers.authorization.replace("Bearer ", "")
            return this.getUserId(token)
        }
    }

    // Get the user_id from google id token.
    public async getUserId(googleIdToken: string): Promise<string> {
        return new Promise((resolve, reject) => {
            verifier.verify(googleIdToken, this.googleClientId, (err, tokenInfo) => {
                if (!err) {
                    resolve(tokenInfo.sub)
                }else{
                    reject(err)
                }
            });
        })
    }
}