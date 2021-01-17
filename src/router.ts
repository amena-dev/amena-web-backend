import * as fastify from 'fastify'
import { TDPhotoRoutes } from './3dphoto/3dphoto.routes'
import { VersionRoutes } from './version/version.routes'

export function Router(server: any): void {
    const tdpRoutes = new TDPhotoRoutes()
    const versionRoutes = new VersionRoutes()
    const apiPrefix = "api/"

    server.register(versionRoutes.initRoutes, {prefix: apiPrefix})
    server.register(tdpRoutes.initRoutes, {prefix: apiPrefix})
}