const db = require('../connection')
const ContactUs  = db.contact_us;
const { Op } = require("sequelize");

module.exports.create = async (data) => {
  return await ContactUs.create(data);
};

module.exports.find_one_where = async (whereClause) => {
  return await ContactUs.findOne({
    where: {
      [Op.or]: whereClause
    }
  });
};
