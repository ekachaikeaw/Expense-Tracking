import { getBearerToken, validateJWT } from "../utils/auth.js";
import { Request, Response, NextFunction } from "express";
import { config } from "../config.js";
import { UserAuthenticateError } from "../utils/errors.js";
import * as usersService from "../services/userService.js";
import { User } from "../db/schema.js";

export async function auth(req: Request, res: Response, next: NextFunction) {
    // Your implementation here
    const token = getBearerToken(req);
    const userID = validateJWT(token, config.jwt.secret);

    const user: User = await usersService.getById(userID);

    if (!user) {
        throw new UserAuthenticateError(`User ID ${userID} not found`);
    }
    req.user = {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
    next();
}
