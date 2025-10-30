const aws = require('aws-sdk')
const logger = require('../utils/logger')
const fs = require('fs')
const path = require('path')

// init s3 client
const s3 = new aws.S3({
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY,
    apiVersion: "2010-12-01",
    region: "ap-south-1",
})

module.exports.upload_file = async (file_path, key, bucket) => {
    try {
        logger.log(`Uploading file to S3: bucket: ${bucket} Key: ${key}`)
        logger.log(`Local file path: ${file_path}`)

        // permissions and location for file to be uploaded
        let params = {
            ACL: "public-read",
            Bucket: bucket,
            Body: fs.createReadStream(file_path),
            Key: key
        }

        const data = await s3.upload(params).promise()
        fs.unlink(file_path, (err) => { logger.log(JSON.stringify(err)) })

        logger.log(`Upload success, file: ${data.Location}`)
        return { success: true, location: data.Location }

    } catch (err) {
        logger.log(`Error occurred while trying to upload to S3 bucket: ${JSON.stringify(err)}`)
        return { success: false, error_message: `Failed to upload file to the server. Please try again` }
    }
}