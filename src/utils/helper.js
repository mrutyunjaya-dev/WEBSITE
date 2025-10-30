module.exports.get_file_extension = async (file) => {
    let ext = file.originalname.split('.')[file.originalname.split('.').length - 1]
    return ext.toUpperCase()
}

module.exports.get_upload_key_by_type = async (type, file) => {
    // prepare file key to upload
    let env = process.env.ENVIRONMENT == "PRODUCTION" ? "prod" : "dev"
    let upload_dir = type
    let sanitized_file_name = file.originalname.split(' ').join('_')
    let upload_key = `${new Date().getTime()}_${sanitized_file_name}`
    let final_upload_key = `${env}/${upload_dir}/${upload_key}`

    return final_upload_key
}