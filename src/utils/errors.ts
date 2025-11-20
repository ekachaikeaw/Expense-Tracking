

export class BadRequestError extends Error {
    constructor(messaage: string) {
        super(messaage);
    }
}

export class UserAuthenticateError extends Error {
    constructor(messsage: string) {
        super(messsage);
    }
}

export class UserForbiddenError extends Error {
    constructor(messsage: string) {
        super(messsage);
    }
}

export class NotFoundError extends Error {
    constructor(messsage: string) {
        super(messsage);
    }
}