import { Handler, NextFunction, Request, Response } from "express";


export function asyncErrorWrapper(handler: Handler) {
    return async function (req: Request, res: Response, next: NextFunction) {
        try {
            await handler(req, res, next);
        } catch (err) {
            next(err);
        }
    }

}