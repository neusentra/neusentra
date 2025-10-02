import type { IUser } from "./user.type";

export interface IUserData {
    user: object | null;
}

export interface ILoginResponse {
    user: IUser;
    iat: number;
    exp: number;
}