const db = require('../connection');
const share_your_profile = db.share_your_profile;
const { Op } = require("sequelize");

module.exports.create = async (data) => {
  return await share_your_profile.create(data);
};