import { compare, hash } from "bcrypt";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { BadRequestError, UserAuthenticateError } from "./errors.js";
import { Request } from "express";
import { randomBytes } from "node:crypto";

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

const TOKEN_ISSUER = "chirpy";

export async function hashPassword(password: string) {
    const saltRounds = 10;
    return hash(password, saltRounds);
}

export async function checkPassword(password: string, hash: string) {
    return compare(password, hash);
}

export function makeJWT(userID: string, expiredIn: number, secret: string): string {
    const iat = Math.floor(Date.now() / 1000);
    return jwt.sign({
        iss: TOKEN_ISSUER,
        sub: userID,
        iat: iat,
        exp: iat + expiredIn
    } satisfies payload,
        secret,
        { algorithm: "HS256"},
    );
}

export function validateJWT(tokenString: string, secret: string): string {
    let decoded: payload;
    try { 
        decoded = jwt.verify(tokenString, secret) as JwtPayload;
    } catch (err: unknown) {
        throw new UserAuthenticateError("Invalid token")    
    }
   
    if (decoded.iss !== TOKEN_ISSUER) {
        throw new UserAuthenticateError("Invalid issuer");
    }
    if (!decoded.sub) {
        throw new UserAuthenticateError("No user ID in token");
    }

    return decoded.sub;
}

export function getBearerToken(req: Request): string {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        throw new UserAuthenticateError("Malformed authorization header");
    }

    return extractBearerToken(authHeader);
}

export function getAPIKey(req: Request): string {
    const authHeader = req.get("Authorization");
    
    if (!authHeader) {
        throw new UserAuthenticateError("Malformed authorization header");
    }

   return extractApiKey(authHeader);
}

export function extractApiKey(authHeader: string) {
    const splitAuth = authHeader.split(" ");
   if (splitAuth.length < 2 || splitAuth[0] !== "ApiKey") {
    throw new BadRequestError("Malformed authorization header");
   } 
   return splitAuth[1];
}


export function extractBearerToken(header: string) {
    const splitAuth = header.split(" ");
    if (splitAuth.length < 2 || splitAuth[0] !== "Bearer") {
        throw new BadRequestError("Malformed authorization header");
    }
    return splitAuth[1];
}

export function makeRefreshToken() {
    return randomBytes(32).toString("hex");
}