require('dotenv').config()
const express = require('express')
const cookieParser = require("cookie-parser")
const sessions = require('express-session')
const helmet = require('helmet')
const cors = require("cors")
const logger = require("./src/utils/logger")
const app = express()
const corsOptions = { exposedHeaders: ["ak", "rk", "ft"] };



app.use(cors(corsOptions));
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});

// load DB connection to sync schema
const db = require('./src/database/connection')
global.__basedir = __dirname
app.use(express.json()); // For JSON requests
app.use(express.urlencoded({ extended: true })); // For form submissions


// --- Cookie & Session ---
const oneDay = 1000 * 60 * 60 * 24
app.use(cookieParser())
app.use(sessions({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    resave: false,
    cookie: { maxAge: oneDay }
}))

// --- Helmet Security ---
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "*.amazonaws.com", "data:"],
        },
    },
}))

// --- Static Files ---
const api_v1_routes = require('./src/routes/api_v1_route.js')
app.use('/api/v1', api_v1_routes)
app.use(function (request, response, next) {
    logger.log(`Ultimate missed URL:: ${request.originalUrl}`)
    let err = new Error('Not Found')
    err.status = 404
    next(err)
})

// --- Error Handling ---   
app.use(function (err, request, response, next) {
    logger.log_error("API Error occurred!", err.Code || 500, err.stack)
    response
        .status(err.Code || 500)
        .json({ success: false, message: err.message, data: (process.env.ENVIRONMENT === 'DEVELOPMENT') ? err : null })
})

// Create a DB Sync & then Server
db.sequelize.sync({ force: false }).then(async () => {
    logger.log('New tables created into DB...')
    logger.log(`Loaded global API key: ${process.env.GLOBAL_API_KEY}`)
    // await Common_Service.some_seeding_function()
    let server = app.listen(process.env.PORT, function () {
        let host = server.address().address
        let port = server.address().port
        logger.log(`Application listening at ${host}:${port}`)
        logger.log(`Application ENVIRONMENT: ${process.env.ENVIRONMENT}`)
        logger.log('----------------------- Server started ------------------------------')
    })
})