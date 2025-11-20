import { NextFunction, Request, Response } from "express";
import { responseWithError } from "../utils/resJson.js";
import { BadRequestError, NotFoundError, UserAuthenticateError, UserForbiddenError } from "../utils/errors.js";


export function errorMiddleware(err: Error, _: Request, res: Response, __: NextFunction) {
    let statusCode = 500;
    let message = "Something went wrong on our end";

    
    if (err instanceof BadRequestError) {
        statusCode = 400;
        message = err.message;
    } else if (err instanceof UserAuthenticateError) {
        statusCode = 401;
        message = err.message;
    } else if (err instanceof UserForbiddenError) {
        statusCode = 403;
        message = err.message;
    } else if (err instanceof NotFoundError) {
        statusCode = 404;
        message = err.message;
    }
    console.log(err.message);
    responseWithError(res, statusCode, message);
}