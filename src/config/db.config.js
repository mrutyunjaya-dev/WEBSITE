const fs = require('fs')

module.exports = {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    pool: {
        max: 20,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}