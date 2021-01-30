import * as fastify from 'fastify'
import cors from 'fastify-cors'
import { Router } from './router';
import { ErrorHandler } from './common/error/error.handler'
import { Config } from './common/config/config'
const server = fastify.fastify();

class REST {
    config: object

    constructor() {
        this.init();
        this.config = new Config().get()
    }

    init = async () => {
        // const repository = (await DBConnection.get()).getRepository(InputImage)
        // console.log(await repository.find())

        server.register(cors, {})
        Router(server)

        server.listen(5000, "0.0.0.0", (err, address) => {
            if (err) throw err;
            console.log(`server(${this.config["env"]}) listening on ${address}`);
        });

        const errorHandler = new ErrorHandler()
        server.setErrorHandler(errorHandler.handler)
    }
}

new REST();