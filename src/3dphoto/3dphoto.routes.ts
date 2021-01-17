import * as fastify from 'fastify';
import { TDPhotoController } from './3dphoto.controller';

export class TDPhotoRoutes {
    initRoutes(server: any, opts: any, next: any): void {
        const controller = new TDPhotoController();

        server.get('/3dphoto/input', controller.get3dphotoInputHandler);
        server.post('/3dphoto/input', controller.post3dphotoInputHandler);
        server.delete('/3dphoto/input', controller.delete3dphotoInputHandler);
        server.get('/3dphoto/output', controller.get3dphotoOutputHandler);

        next();
    }
}