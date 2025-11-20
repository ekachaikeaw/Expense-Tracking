import { UserResponse } from "src/controllers/usersController";

declare global {
    namespace Express {
        interface Request {
            user?: UserResponse;
        }
    }
}

export {};
