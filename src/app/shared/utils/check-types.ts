/**
 * Helper function that checks if supplied parameter is an object type or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is an object or false if it's not.
 */
export const isObject = (data: unknown) => {
  return (
    typeof data === "object" &&
    Object.prototype.toString.call(data) ===
      "[object Object]"
  );
};

/**
 * Helper function that checks if supplied parameter is an array or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is an array or false if it's not.
 */
export const isArray = (data: unknown) => {
  return (
    (typeof data === "object" &&
      Object.prototype.toString.call(data) === "[object Array]") ||
    Array.isArray(data)
  );
};

/**
 * Helper function that checks if supplied parameter is a string type or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is a string or false if it's not.
 */
export const isString = (data: unknown) => {
  return typeof data === "string";
};

/**
 * Helper function that checks if supplied parameter is a number type or not.
 * @param {any} value - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is a number or false if it's not.
 */
export const isNumber = (value: unknown) => {
  try {
    return (
      typeof value === "number" &&
      value === value &&
      value !== Infinity &&
      value !== -Infinity
    );
  } catch (err) {
    return false;
  }
};

/**
 * Helper function that checks if supplied parameter is a boolean type or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is a boolean type or false if it's not.
 */
export const isBoolean = (data: unknown) => {
  return typeof data === "boolean" || data === true || data === false;
};





/**
 * Helper function that checks if supplied parameter is undefined type or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is undefined or false if it's not.
 */
export const isUndefined = (data: unknown = null) => {
  return typeof data === "undefined" || data == undefined ? true : false;
};

/**
 * Helper function that checks if supplied parameter is defined or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is defined or false if it's not.
 */
export const isDefined = (data: unknown) => {
  return typeof data !== "undefined";
};

/**
 * Helper function that checks if supplied parameter is null type or not.
 * @param {any} data - Represents the data to run check on. Accepts international numbers too
 * @returns {boolean} - Returns true if supplied parameter (data) is a valid phone number or false if it's not.
 */
export const isNull = (data: unknown) => {
  return data == null || false;
};

/**
 * Cloned Helper function that checks if supplied parameter is empty (has no value) or not.
 * Cloned from the isEmpty() function
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is empty or false if it's not.
 */
export let empty = (data: unknown) => {
  return isEmpty(data);
};

/**
 * Helper function that checks if supplied parameter is empty (has no value) or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is empty or false if it's not.
 */
export const isEmpty = (data: any) => {
  let returnValue = false;
  if (isString(data) && (data === "" || data.trim() === "")) returnValue = true;
  else if (isNumber(data) && data === 0) returnValue = true;
  else if (isBoolean(data) && data === false) returnValue = true;
  else if (isObject(data) && Object.values(data).length === 0) returnValue = true;
  else if (isArray(data) && data.length === 0) returnValue = true;
  else if (isUndefined(data)) returnValue = true;
  else if (isNull(data)) returnValue = true;

  return returnValue;
};
