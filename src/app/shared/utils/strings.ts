import { DynamicObjectType } from '@core/interfaces/generic.model';
import { isString } from './check-types';

/**
 * Converts a string into a human-readable format by trimming, lowercasing, and replacing underscores with spaces.
 *
 * @param {string} value - the input string to be humanized
 * @return {string} the humanized string
 */
export const humanize = (value: string) => {
  if (!isString(value)) return value;
  return uppercaseWords(value.trim().toLowerCase().replace('/[_]+/', ' '));
};

/**
 * Helper function to capitalize first letter of a string
 * @param text {string}
 * @returns {string}
 */
export const capitalizeWords = (text: string) => {
  if (!text) {
    return '';
  } else {
    return text
      .toLowerCase()
      .split(' ')
      .map((el) => {
        return el.charAt(0).toUpperCase() + el.substring(1);
      })
      .join(' ');
  }
};

/**
 * Uppercase the first character of each word in a string
 * @param {string} str
 * @returns
 */
export const uppercaseWords = (str: string) => {
  return capitalizeWords(str);
};

/**
 * Helper function to trim str
 * @param {string} value - Represents the data to run check on.
 * @returns {string} - Returns the trimmed str.
 */
export const trim = (value = '') => {
  return isString(value) ? value.trim() : value;
};

/**
 * Helper function to convert str to lower case
 * @param {string} value - Represents the data to run check on.
 * @returns {string} - Returns the trimmed str.
 */
export const stringToLowercase = (value = '') => {
  return isString(value) ? value.toLowerCase() : value;
};

/**
 * Helper function to  str to upper case
 * @param {string} value - Represents the data to run check on.
 * @returns {string} - Returns the trimmed str.
 */
export const stringToUppercase = (value = '') => {
  return isString(value) ? value.toUpperCase() : value;
};

/**
 * Replaces a specified value in a string with another value.
 *
 * @param {string} searchValue - The value to search for in the string.
 * @param {string} replaceValue - The value to replace the searched value with.
 * @param {string} value - The string to perform the replacement on.
 * @return {string} The modified string with the replacement made.
 */
export const stringReplace = (
  searchValue: string,
  replaceValue: string,
  value: string
) => {
  if (
    !(
      isString(value) &&
      isString(searchValue) &&
      (searchValue as any) instanceof RegExp
    )
  ) {
    return value;
  }
  return value.replace(searchValue, replaceValue);
};

/**
 * Helper function to convert string boolean to boolean type
 * @param {string} value - Represents the data to run check on.
 * @returns {string} - Returns the boolean type.
 */
export const stringToBoolean = (value = '') => {
  value = value && isString(value) ? trim(value) : String(value);
  return value === 'true';
};

/**
 * Helper function to convert a string to underscore format.
 *
 * @param {string} value - The string to be converted.
 * @return {string} The string in underscore format.
 */
export const underscore = (value: string) => {
  return isString(value)
    ? stringToLowercase(trim(value.replace(/[\s]+/g, '_')))
    : value;
};

/**
 * Generates a random string of 32 characters.
 *
 * @return {string} A random string of 32 characters.
 */
export const makeRandomString = () => {
  let text = '';
  let possible = 'abcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

/**
 * Encodes a given string using encodeURIComponent.
 *
 * @param {string} strParam - The string to be encoded.
 * @return {string} The encoded string.
 */
export const urlEncode = (strParam: string) => {
  let str = strParam;
  str += '';
  return encodeURIComponent(str);
};

/**
 * Encodes a given string using a custom rawurlencode algorithm.
 *
 * @param {string} strParam - The string to be encoded.
 * @return {string} The encoded string.
 */
export const rawUrlEncode = (strParam: string) => {
  let str = strParam;
  str += '';
  return urlEncode(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
};

/**
 * Decodes a URL-encoded string.
 *
 * @param {string} str - The URL-encoded string to be decoded.
 * @return {string} The decoded string.
 */
export const urlDecode = (str: string) => decodeURIComponent(str + '');

/**
 * Decodes a URL-encoded string.
 *
 * @param {string} str - The URL-encoded string to be decoded.
 * @return {string} The decoded string.
 */
export const rawUrlDecode = (str: string) =>
  urlDecode(`${str}`.replace(/%(?![\da-f]{2})/gi, () => '%25'));

/**
 * Converts a dynamic object to a string representation.
 *
 * @param {DynamicObjectType} obj - The dynamic object to be converted.
 * @return {string} A string representation of the object, with key-value pairs separated by ' !important; '.
 */
export const convertObjToString = (obj: DynamicObjectType) => {
  return Object.entries(obj)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' !important; ');
};

/**
 * Converts a dynamic object to a HTTP parameter string.
 *
 * @param {DynamicObjectType} obj - The dynamic object to be converted.
 * @return {string} A string representation of the object, with key-value pairs separated by '&'.
 */
export const buildHttpParams = (obj: DynamicObjectType) => {
  return Object.entries(obj)
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
};

export const buildURLSearchParams = (obj: DynamicObjectType): string => {
  if (!obj || Object.keys(obj).length === 0) {
    return '';
  }
  const urlParams = new URLSearchParams();
  for (const key in obj) {
    if (obj.hasOwnProperty(key as string)) {
      const value = obj[key as keyof typeof obj];
      if (value) {
        urlParams.set(key, value.toString());
      }
    }
  }
  return urlParams.toString();
};
/**
 * Converts a given hex color code to an object with rgba values.
 *
 * @param {string | null | undefined} hex - The hex color code to be converted.
 * @return {{ r: number, g: number, b: number, a: number}} An object with rgba values.
 */
export const hexToRgba = (
  hex: string | null | undefined
): { r: number; g: number; b: number; a: number } => {
  if (!hex) {
    return { r: 0, g: 0, b: 0, a: 1 };
  }
  const hexString = hex.replace(/^#/, '').toLocaleUpperCase();
  if (
    hexString.length !== 3 &&
    hexString.length !== 4 &&
    hexString.length !== 6 &&
    hexString.length !== 8
  ) {
    return { r: 0, g: 0, b: 0, a: 1 };
  }

  let r, g, b, a;

  if (hexString.length === 3 || hexString.length === 4) {
    // Shorthand hex color (e.g., #03FA)
    r = parseInt(hexString[0] + hexString[0], 16);
    g = parseInt(hexString[1] + hexString[1], 16);
    b = parseInt(hexString[2] + hexString[2], 16);
    a =
      hexString.length === 4
        ? parseInt(hexString[3] + hexString[3], 16) / 255
        : 1;
  } else if (hexString.length === 6 || hexString.length === 8) {
    // Full-length hex color (e.g., #0033FFAA)
    r = parseInt(hexString.substring(0, 2), 16);
    g = parseInt(hexString.substring(2, 4), 16);
    b = parseInt(hexString.substring(4, 6), 16);
    a =
      hexString.length === 8
        ? parseInt(hexString.substring(6, 8), 16) / 255
        : 1;
  } else {
    return { r: 0, g: 0, b: 0, a: 1 };
  }
  return { r, g, b, a };
};
