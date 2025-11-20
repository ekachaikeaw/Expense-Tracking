import { Request, Response } from "express";
import { responseWithJSON } from "../utils/resJson.js";
import * as usersService from "../services/userService.js";
import { NewUser } from "../db/schema.js";
import { BadRequestError } from "../utils/errors.js";
import { hashPassword } from "../utils/auth.js";

type requestCreateUser = {
    email: string;
    password: string;
};
export type UserResponse = Omit<NewUser, "hashedPassword">;

export async function create(req: Request, res: Response) {
    const params: requestCreateUser = req.body;
    if (!params.email || !params.password) {
        throw new BadRequestError("Missing required fields");
    }

    const hashed = await hashPassword(params.password);
    params.password = hashed;
    const user = await usersService.createUser({
        email: params.email,
        hashedPassword: params.password,
    } satisfies NewUser);

    if (!user) {
        throw new Error("Create user unsuccesful");
    }

    responseWithJSON(res, 201, {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    } satisfies UserResponse);
}

export async function getByEmail(req: Request, res: Response) {
    const email = req.body?.email;
    if (!email) {
        throw new BadRequestError("Missing required fields");
    }
    const user = await usersService.getByEmail(email);
    if (!user) {
        throw new Error("User not found");
    }

    responseWithJSON(res, 200, {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    } satisfies UserResponse);
}
