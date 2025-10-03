export const ERROR_CODES = {
  DEFAULT: {
    statusCode: 1000,
    message: 'Internal error',
  },
  INTERNAL: {
    statusCode: 1001,
    message: 'Internal error',
  },
  INPUT: {
    statusCode: 1002,
    message: 'Invalid input format',
  },
  AUTH_ERROR: {
    statusCode: 1003,
    message: 'Authentication error',
  },
  NOT_FOUND: {
    statusCode: 1004,
    message: 'Resource not found',
  },
  FORBIDDEN: {
    statusCode: 1005,
    message: 'This request cannot be fulfilled',
  },
  REQUEST_BODY_LARGE: {
    statusCode: 1006,
    message: 'Request body too large',
  },
  INVALID_ACCESS_TOKEN: {
    statusCode: 1007,
    message: 'Invalid access token',
  },
  INVALID_REFRESH_TOKEN: {
    statusCode: 1008,
    message: 'Invalid refresh token',
  },
  NO_AUTH_TOKEN: {
    statusCode: 1009,
    message: 'No auth token',
  },
  MAX_LOGIN_LIMIT: {
    statusCode: 1010,
    message: 'Maximum login limit reached',
  },
  INACTIVE_USER: {
    statusCode: 1011,
    message: 'User is inactive',
  },
  MESSAGE_BODY: {
    statusCode: 1012,
    message: 'Either messageText or imageUrl is required',
  },
  INVALID_USERNAME_OR_PASSWORD: {
    statusCode: 1013,
    message: 'Invalid Username or Password',
  },
  REQUEST_BODY_EMPTY: {
    statusCode: 1014,
    message: 'Request body is empty',
  },
};
