module.exports.log = (message) => {
    const dateTime = new Date().toISOString();
    let temp_str = `${dateTime}> ${message}`;
    console.log(temp_str);
}

module.exports.log_error = (message, code, details) => {
    const dateTime = new Date().toISOString();
    let err = {
        message: message,
        code: code,
        details: JSON.stringify(details)
    };
    let temp_str = dateTime + '> ' + JSON.stringify(err);
    console.log(' ');
    console.log(temp_str);
}
