const path = require("path");
const fs = require("fs");
const useragent = require("useragent");
const Job_Service = require("../database/models/job.model");
const Email_Service = require("../services/email.service");
const { JOB_TYPES, EXPERIENCE_LEVELS, JOB_TITLES } = require("../constants/job");
const db = require("../database/connection");
const Job = db.jobs;


exports.create_job = async (req, res) => {
  try {
    const {
      job_title,
      job_type,
      experience_required,
      location,
      salary_range,
      department,
      job_description
    } = req.body;

    // ✅ Convert numeric values to string (for email template / validation)
    const jobTitleText = JOB_TITLES[job_title];
    const jobTypeText = JOB_TYPES[job_type];
    const experienceText = EXPERIENCE_LEVELS[experience_required];

    if (!jobTitleText || !jobTypeText || !experienceText ) {
      return res.status(400).json({
        success: false,
        message: "Invalid job payload selection (refer constants)."
      });
    }

    // ✅ Prevent duplicate job (same job title + experience)
    const existingJob = await Job.findOne({
      where: {
        job_title,
        experience_required
      }
    });

    if (existingJob) {
      return res.status(409).json({
        success: false,
        message: `A job post with "${jobTitleText}" and experience "${experienceText}" already exists.`
      });
    }

    // Parse Device Info
    const agent = useragent.parse(req.headers['user-agent']);
    const isMobile = /Android|iOS/.test(agent.os.toString());
    const device_info = isMobile ? 'Mobile' : `Web Browser: ${agent.toString()}`;
    const platform = isMobile ? 'Mobile Device' : 'Desktop Browser';

    // Capture IP
    let request_ipv4 = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;

    // ✅ Save numeric values in DB
    const newJob = await Job_Service.create({
      job_title,
      job_type,
      experience_required,
      location,
      department,
      salary_range,
      job_description,
      platform,
      device_info,
      request_ipv4
    });

    return res.status(200).json({
      success: true,
      message: "Job created successfully.",
      data: newJob
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};


exports.get_all = async (req, res) => {
  try {
    const jobs = await Job_Service.get_all();
    return res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.get_by_id = async (req, res) => {
  try {
    const job = await Job_Service.get_by_id(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    return res.status(200).json({ success: true, data: job });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.stopHiring = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Check if the job exists
    const job = await Job.findOne({ where: { id } });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found."
      });
    }

    // 2️⃣ If already inactive
    if (!job.is_active) {
      return res.status(400).json({
        success: false,
        message: "Hiring for this job is already stopped."
      });
    }

    // 3️⃣ Update the job status
    job.is_active = false;
    await job.save();

    // 4️⃣ (Optional) Send notification or email
    // await Email_Service.send_email({...});

    return res.status(200).json({
      success: true,
      message: `Hiring for job "${job.job_title_text}" has been stopped.`,
      data: job
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};
