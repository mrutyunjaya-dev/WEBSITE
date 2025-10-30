const moment = require('moment')
const logger = require('../utils/logger')
const User = require('../database/models/user.model')
const twilio_client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

// Sample code: https://github.com/Sean-Bradley/AWS-SNS-SMS-with-NodeJS/blob/master/app.js
// https://docs.aws.amazon.com/sns/latest/dg/channels-sms-senderid-india.html

module.exports.send_otp_sms = async (user_id, otp, country_code, mobile, type) => {
    let to_phone_number = country_code.toString() + mobile.toString()
    logger.log(`Sending OTP to user: ${to_phone_number} OTP: ${otp} type: ${type}`)
    let twilio_response = {}

    let message_text = `${otp} is your ${process.env.APP_NAME} authentication code and will expire in 5 mins.`
    try {
        twilio_response = await twilio_client.messages.create(
            {
                body: message_text,
                messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
                to: to_phone_number
            }
        )
    } catch (e) {
        logger.log_error("Error occurred while sending OTP.", 500, e)
        twilio_response = e
    }

    // Update user details with OTP data
    update_fields = { otp: otp }

    if (twilio_response.sid && !twilio_response.errorCode) {
        logger.log(`OTP sent successfully: ${twilio_response.sid} to user id: ${user_id}`)
        let otp_validity = moment()
        update_fields.otp_valid_till = otp_validity.add(5, 'minutes')
    }

    // Update user details with OTP data
    await User.update(user_id, update_fields)

    return twilio_response.sid ? true : false
}
