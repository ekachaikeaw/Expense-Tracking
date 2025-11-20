import { Request, Response } from "express";
import { BadRequestError, UserAuthenticateError } from "../utils/errors.js";
import { checkPassword, makeJWT, makeRefreshToken } from "../utils/auth.js";
import { responseWithJSON } from "../utils/resJson.js";
// import { getUserByEmail } from "../db/queries/users.js";
import * as usersService from "../services/userService.js";
import { UserResponse } from "./usersController.js";
import { config } from "../config.js";

type LoginResponse = UserResponse & { token: string };

export async function handlerLogin(req: Request, res: Response) {
    type loginReq = {
        email: string;
        password: string;
    };

    const params: loginReq = req.body;
    if (!params.email || !params.password) {
        throw new BadRequestError("Required field is missing");
    }
    const user = await usersService.getByEmail(params.email);
    if (!user) {
        throw new UserAuthenticateError("Invalid email or password");
    }

    const matching = await checkPassword(params.password, user.hashedPassword);
    if (!matching) {
        throw new UserAuthenticateError("Invalid email or password");
    }

    let duration = config.jwt.defaultDuration;

    const accessToken = makeJWT(user.id, duration, config.jwt.secret);

    responseWithJSON(res, 200, {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        token: accessToken,
    } satisfies LoginResponse);
}
