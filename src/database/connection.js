"use strict"

const Sequelize = require('sequelize')
const fs = require('fs')
const path = require('path')
const config = require('../config/db.config');
const logger = require('../utils/logger')

const db = {}

logger.log(`Node environment: ${process.env.ENVIRONMENT}`);
logger.log(`database: ${config.database}`);
logger.log(`username: ${config.username}`);
logger.log(`host: ${config.host}`);

const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
        host: config.host,
        dialect: config.dialect,
        pool: {
            max: config.pool.max,
            min: config.pool.min,
            acquire: config.pool.acquire,
            idle: config.pool.idle
        },
        logging: false //TODO: Please provide a function here to handle logging...
    }
)

logger.log('---------------------------------------------------------------------------------------')

// test the connection
sequelize.authenticate().then(function (err) {
    logger.log(`Database Connection has been established successfully.`)
}).catch(function (err) {
    logger.log(`Unable to connect to the database: ${JSON.stringify(err)}`)
})

// https://sequelize.readthedocs.io/en/latest/docs/models-definition/

fs.readdirSync(__dirname + '/entities').filter(function (file) {
    return (file.indexOf(".js") !== -1) && (file !== "index.js")
}).forEach(function (file) {
    const model = require(path.join(__dirname, '/entities/', file))(sequelize, Sequelize.DataTypes)
    db[model.name] = model
});
Object.keys(db).forEach(function (modelName) {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db)
    }
})

db.Sequelize = Sequelize
db.sequelize = sequelize

module.exports = db