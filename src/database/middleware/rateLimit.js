const rateLimit = require("express-rate-limit");

const contactFormLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // ⛔ Allow only 5 requests per 10 minutes from same IP
  message: {
    success: false,
    message: "Too many submissions from this IP. Please try again after 10 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { contactFormLimiter };
