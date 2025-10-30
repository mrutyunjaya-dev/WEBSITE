module.exports = class ApiError extends Error {

    constructor(message, errorCode, error = null) {
        super();
        this.message = message + (error != null ? ': ' + error.message : '');
        this.Trace = error != null ? error.stack : '';
        this.Code = errorCode;
    }

}
