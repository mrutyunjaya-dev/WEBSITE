const ApiError = require('./api.error');
const joi = require('joi');
const logger = require('./logger');

///////////////////////////////////////////////////////////////////////

exports.throwInputValidationError = (errorMessages) => {
    const message = 'Input validation errors: ' + errorMessages;
    throw new ApiError(message, 400);
}

exports.throwDuplicateUserError = (message, error) => {
    throw new ApiError(message, 400, error);
}

exports.throwNotFoundError = (message) => {
    throw new ApiError(message, 404);
}

exports.throwUnauthorizedUserError = (message) => {
    throw new ApiError(message, 401);
}

exports.throwForebiddenAccessError = (message) => {
    throw new ApiError(message, 403);
}

exports.throwDbAccessError = (message, error) => {
    throw new ApiError(message, 503, error);
}

exports.throwConflictError = (message) => {
    throw new ApiError(message, 409);
}

exports.throwInternalServerError = (message, error) => {
    throw new ApiError(message, 500, error);
}

exports.handleValidationError = (error) => {
    if (error.isJoi === true) {
        logger.log(error.message);
        const errorMessages = error.details.map(x => x.message.replace(/["]+/g, "'"));
        exports.throwInputValidationError(errorMessages.join(','));
    }
    else {
        exports.throwInputValidationError(error.message);
    }
}
