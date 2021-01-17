export class UnauthorizedException extends Error {
    constructor(message: string = "Authorization required.") { super(message) }
}

export class BadrequestException extends Error {
    constructor(message: string = "Bad request.") { super(message) }
}

export class NotfoundException extends Error {
    constructor(message: string = "Not found.") { super(message) }
}

export class TooManyRequestsException extends Error {
    constructor(message: string = "Too many requests.") { super(message) }
}