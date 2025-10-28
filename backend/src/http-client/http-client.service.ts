import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { CustomLogger } from 'src/logger/custom-logger.service';

@Injectable()
export class HttpClientService {
  constructor(
    private readonly httpService: HttpService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(HttpClientService.name);
  }

  /**
   * Method to send a GET request to a given URL.
   * @param {string} url URL string.
   * @returns {string} Response data.
   */
  async get<T>(url: string, config?: any) {
    try {
      const { data } = await lastValueFrom(
        this.httpService.get<T>(url, config),
      );
      return data;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  /**
   * Method to send a POST request to a given URL.
   * @param {string} url URL string.
   * @param {any} param Request Parameters.
   * @returns {string} Response data.
   */
  async post<T>(url: string, param: any, config?: any): Promise<T> {
    try {
      const { data } = await lastValueFrom(
        this.httpService.post<T>(url, param, config),
      );
      return data;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  /**
   * Method to send a PUT request to a given URL.
   * @param {string} url URL string.
   * @param {any} param Request Parameters.
   * @returns {string} Response data.
   */
  async put<T>(url: string, param: any, config?: any): Promise<T> {
    try {
      const { data } = await lastValueFrom(
        this.httpService.put<T>(url, param, config),
      );
      return data;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  /**
   * Method to send a PATCH request to a given URL.
   * @param {string} url URL string.
   * @param {any} param Request Parameters.
   * @returns {string} Response data.
   */
  async patch<T>(url: string, param: any, config?: any): Promise<T> {
    try {
      const { data } = await lastValueFrom(
        this.httpService.patch<T>(url, param, config),
      );
      return data;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  /**
   * Method to send a DELETE request to a given URL.
   * @param {string} url URL string.
   * @returns {string} Response data.
   */
  async delete<T>(url: string, config?: any): Promise<T> {
    try {
      const { data } = await lastValueFrom(
        this.httpService.delete<T>(url, config),
      );
      return data;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
