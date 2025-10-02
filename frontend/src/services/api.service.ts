import config from '@/config/config';
import type { API_METHODS } from '@/enums/common.enum';
import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';

export interface ResponseType<T> {
    success: boolean
    status: number
    message: string
    data: T
};

export const axiosInstance = axios.create({
    baseURL: config.api.baseUrl,
    timeout: config.api.timeout,
});

/**
 * A generic HTTP service function that performs API requests using Axios.
 *
 * @template T - The expected response type of the API call.
 *
 * @param {API_METHODS} method - The HTTP method to use for the request (e.g., GET, POST, etc.).
 * @param {string} url - The endpoint URL for the API request.
 * @param {unknown} [data] - The request payload to send with the API call (optional).
 * @param {unknown} [params] - Query parameters to include in the API request (optional).
 * @param {AxiosRequestConfig} [config] - Additional Axios configuration options (optional).
 *
 * @returns {Promise<T>} - A promise that resolves to the strongly typed response data.
 *
 * @throws {any} - Throws an error if the request fails. If the error is an Axios error, it throws
 *                 the response data, request, or error message. Otherwise, it throws a generic error.
 */
export const httpService = async <T>(
    method: API_METHODS,
    url: string,
    data?: unknown,
    params?: unknown,
    config?: AxiosRequestConfig
): Promise<ResponseType<T>> => {
    try {
        const response: AxiosResponse<ResponseType<T>> = await axiosInstance({
            url,
            method,
            data,
            params,
            ...config,
        });

        return {
            success: response.data.success,
            status: response.status,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error;
        }
        throw new Error('An unknown error occurred');
    }
};