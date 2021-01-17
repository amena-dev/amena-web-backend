import config_base from './config.json'
import config_local from './config-local.json'
import config_production from './config-production.json'

export class Config {
    env: string
    content: object

    constructor() {
        this.env = process.env.AMENA_ENV || "local"

        switch(this.env) {
            case "local":
                this.content = Object.assign(config_base, config_local)
                break;
            case "production":
                this.content = Object.assign(config_base, config_production)
                break;
            default:
                this.content = config_base
                break;
        }
    }

    get() {
        return this.content
    }
}