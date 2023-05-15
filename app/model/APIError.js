//NOTE: now only used for the Query API (endpoint of the workspace API)
export default class APIError {
  static BAD_REQUEST = "Bad request, please provide the correct parameters"; //400
  static ACCESS_DENIED = "Access denied"; //403
  static NOT_FOUND = "Resource not found"; //404
  static INTERNAL_SERVER_ERROR = "Internal server error"; //500

  construct(errorMsg) {
    this.errorMsg = errorMsg;
  }

  toHTTPErrorCode = () => {
    let errorCode = 500;
    switch (this.errorMsg) {
      case APIError.BAD_REQUEST:
        errorCode = 400;
        break;
      case APIError.ACCESS_DENIED:
        errorCode = 403;
        break;
      case APIError.NOT_FOUND:
        errorCode = 404;
        break;
      case APIError.INTERNAL_SERVER_ERROR:
        errorCode = 500;
        break;
    }
    return errorCode;
  };
}
