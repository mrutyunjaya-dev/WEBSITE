const jwt = require('njwt')
const logger = require('../utils/logger')
const ROLES = require('../constants/roles');

// ------------------------- include all controllers here ----------------------------
const authController = require('../controllers/auth.controller')

module.exports.validate_user_token = async (request, response, next) => {
    // Validate Global API KEY in request header for API request
    let auth_token = request.headers.authorization ? request.headers.authorization : null
    if (!auth_token) {
        return response.status(403).json({ success: false, message: 'Access Denied! Auth token is required.', data: null })
    } else {
        auth_token = auth_token.replace('Bearer ', '')
        let user_details = await authController.get_user_by_auth_token(auth_token)

        if (!user_details) {
            return response.status(403).json({ success: false, message: 'Access Denied! Invalid or expired auth token.', data: null })
        }

        let {password, password_token, last_login, last_pass_reset_date, created_at, updated_at, deleted_at, ...user} = user_details.dataValues
        request.user = user

        next()
    }
}

module.exports.is_entity_admin = async (req, response, next) => {
    if (!req.user || req.user.role != 1) {
        return response.status(403).json({ success: false, message: 'Access Denied! Admin Priviledge Required.', data: null })
    }

    next()
}