const nodemailer = require("nodemailer")
const aws = require('aws-sdk')

const logger = require('../utils/logger')

// init SES client
const ses = new aws.SES({
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY,
    apiVersion: "2010-12-01",
    region: "ap-south-1",
})

let transporter = nodemailer.createTransport({
    SES: { ses, aws },
})

module.exports.send_test_email = async (email_params) => {
    logger.log(`Sending test email to: ${email_params.to}`)

    try {
        let mail_options = {
            from: `"${process.env.APP_NAME}" <info@techindia.me>`,
            to: email_params.to,
            subject: "Hello from LIMS ✔", // Subject line
            html: "<b>Hey there, this is test email received from Tech India LIMS team.</b>", // html body
            ses: { Tags: [], },
        }

        // send mail with defined transport object
        let info = await transporter.sendMail(mail_options)
        logger.log(`Email sent: ${info.messageId}`)

        return { success: true, message_id: info.messageId }

    } catch (e) {
        logger.log_error("Error occurred while sending email.", 500, e.message)
        return { success: false, error: e.message }
    }
}

module.exports.send_email = async (email_params) => {
    logger.log(`Sending email to: ${email_params.email_to}, Subject: ${email_params.subject}`)

    try {
        let mail_options = {
            from: `"${process.env.APP_NAME}" <no-reply@spplmail.in>`,
            to: email_params.email_to,
            subject: email_params.subject,
            html: email_params.body,
            ses: { Tags: [], },
        }

        // send mail with defined transport object
        let info = await transporter.sendMail(mail_options)
        logger.log(`Email sent: ${info.messageId}`)

        return { success: true, message_id: info.messageId }

    } catch (e) {
        logger.log_error("Error occurred while sending email.", 500, e.message)
        return { success: false, error: e.message }
    }
}
