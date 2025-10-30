const db = require('../connection');
const Job = db.jobs;
const { Op } = require("sequelize");

module.exports.create = async (data) => {
  return await Job.create(data);
};

module.exports.get_all = async () => {
  return await Job.findAll({
    where: { is_active: true },
    order: [["createdAt", "DESC"]]
  });
};

module.exports.get_by_id = async (id) => {
  return await Job.findOne({ where: { id } });
};

module.exports.find_duplicate_title = async (job_title) => {
  return await Job.findOne({ where: { job_title } });
};
