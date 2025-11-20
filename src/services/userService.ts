import * as userRepo from "../repositories/usersRepo.js";
import { NewUser } from "src/db/schema.js";

export async function createUser(user: NewUser) {
    return userRepo.create(user);
}

export async function getByEmail(email: string) {
    return userRepo.getByEmail(email);
}

export async function getById(id: string) {
    return userRepo.getById(id);
}
