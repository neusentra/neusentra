/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import * as K from 'src/common/constants';
import { readFileSync } from 'fs';

@Injectable()
export class UtilsService {
  /**
   * Validates option text input.
   * @param {string} str String
   * @returns {string} Converted string
   */
  toCamel = (str: string): string => {
    return str.replace(/_([a-z1-3])/g, (word: string) => word[1].toUpperCase());
  };

  /**
   * Checks object is an actual JavaScript object.
   * @param {any} obj Object to be checked
   * @returns {boolean} Whether object or not
   */
  private isObject = (obj: any[] | any): boolean => {
    return (
      obj === Object(obj) &&
      obj instanceof Date === false &&
      !Array.isArray(obj) &&
      typeof obj !== 'function'
    );
  };

  /**
   * Converts object or object array's keys to camel case.
   * @param {any[] | any} obj Object or object array
   * @returns {any[] | any} Converted object or object array
   */
  convertKeysToCamelCase = (obj: any[] | any): any[] | any => {
    if (this.isObject(obj)) {
      const newObj = {};

      Object.keys(obj).forEach((key) => {
        newObj[this.toCamel(key)] = this.convertKeysToCamelCase(obj[key]);
      });

      return newObj;
    } else if (Array.isArray(obj)) {
      return obj.map((i) => this.convertKeysToCamelCase(i));
    }

    return obj;
  };

  escapeSpecialCharacters = (str: string): string => {
    return str.replace(K.SPECIAL_CHARACTERS, (match) => `\\${match}`);
  };
}
