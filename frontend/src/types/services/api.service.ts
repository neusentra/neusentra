import type { AxiosError } from "axios";

export interface ResponseType<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T | null;
    error: AxiosError | Error | null;
}