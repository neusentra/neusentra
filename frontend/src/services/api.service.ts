import axios, { type AxiosRequestConfig, type AxiosError } from 'axios';
import type { API_METHODS } from '@/enums/common.enum';
import config from '@/config/config';

export interface ResponseType<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T | null;
    error: AxiosError | Error | null;
}

export const axiosInstance = axios.create({
    baseURL: config.api.baseUrl,
    timeout: config.api.timeout,
});

/**
 * A generic HTTP service function that performs API requests using Axios.
 *
 * @template T - The expected response type of the API call.
 * @param {API_METHODS} method - The HTTP method to use for the request.
 * @param {string} url - The endpoint URL for the API request.
 * @param {unknown} [data] - The request payload to send with the API call (optional).
 * @param {unknown} [params] - Query parameters to include in the API request (optional).
 * @param {AxiosRequestConfig} [config] - Additional Axios configuration options (optional).
 * @returns {Promise<ResponseType<T>>} - A promise that resolves to the strongly typed response data.
 */
export const httpService = async <T>(
    method: API_METHODS,
    url: string,
    data?: unknown,
    params?: unknown,
    config?: AxiosRequestConfig
): Promise<ResponseType<T>> => {
    try {
        const response = await axiosInstance<T>({
            url,
            method,
            data,
            params,
            ...config
        });

        return {
            success: true,
            statusCode: response.status,
            message: response.statusText || 'Success',
            data: response.data,
            error: null
        };
    } catch (error) {
        const axiosError = error as AxiosError;

        if (axiosError.response) {
            return {
                success: false,
                statusCode: axiosError.response.status,
                message: axiosError.message || 'Request failed',
                data: null,
                error: axiosError
            };
        }

        if (axiosError.request) {
            return {
                success: false,
                statusCode: 0,
                message: axiosError.message || 'Network error',
                data: null,
                error: axiosError
            };
        }

        return {
            success: false,
            statusCode: 0,
            message: axiosError.message || 'Unknown error',
            data: null,
            error: axiosError
        };
    }
};