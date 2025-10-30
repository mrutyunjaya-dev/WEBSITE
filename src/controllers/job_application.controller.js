const path = require('path');
const fs = require('fs');
const db = require('../database/connection');
const Job_Application = db.job_applications;
const s3Service = require('../services/s3.service');
const emailService = require('../services/email.service');
const { Op } = require('sequelize');

exports.job_apply = async (req, res) => {
  try {
    let { full_name, phone, email, position, experience_years, location, notice_period, job_id } = req.body;

    // Validate required fields
    if (!full_name || !phone || !email || !position || !experience_years || !location || !notice_period) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: full_name, phone, email, position, experience_years, location, notice_period"
      });
    }

    // Convert experience_years to Number
    experience_years = Number(experience_years);
    if (isNaN(experience_years)) {
      return res.status(400).json({
        success: false,
        message: "experience_years must be a valid number."
      });
    }

    // Check duplicate applications in last 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const existingApplication = await Job_Application.findOne({
      where: {
        email,
        phone,
        createdAt: { [Op.gte]: threeMonthsAgo }
      },
      order: [['createdAt', 'DESC']]
    });

    if (existingApplication) {
      const lastApplicationDate = new Date(existingApplication.createdAt);
      const canApplyAgainDate = new Date(lastApplicationDate);
      canApplyAgainDate.setMonth(canApplyAgainDate.getMonth() + 3);

      const daysRemaining = Math.ceil((canApplyAgainDate - new Date()) / (1000 * 60 * 60 * 24));

      return res.status(400).json({
        success: false,
        message: `You have already applied recently. You can apply again after ${canApplyAgainDate.toLocaleDateString()}.`,
        data: {
          last_application_date: lastApplicationDate.toLocaleDateString(),
          last_applied_position: existingApplication.position,
          can_apply_again_after: canApplyAgainDate.toLocaleDateString(),
          days_remaining: daysRemaining
        }
      });
    }

    // Upload documents to S3
    const uploadedFiles = req.files || [];
    const s3Urls = [];

    for (const file of uploadedFiles) {
      const timestamp = Date.now();
      const s3Key = `job_applications/${timestamp}_${file.originalname}`;
      const uploadResult = await s3Service.upload_file(file.path, s3Key, process.env.AWS_APPLICATION_ASSETS_S3_BUCKET);

      if (uploadResult.success) s3Urls.push(uploadResult.location);
    }

    // Save to DB
    const newApplication = await Job_Application.create({
      full_name,
      phone,
      email,
      position,
      experience_years,
      location,
      notice_period,
      job_id,
      document_uploads: s3Urls
    });

    // Only Admin Email (User Email Removed)
    const adminTemplatePath = path.join(__dirname, "../views/email_templates/job_application_admin.html");

    let adminEmailHtml = fs.readFileSync(adminTemplatePath, "utf8")
      .replace(/{{name}}/g, full_name)
      .replace(/{{phone}}/g, phone)
      .replace(/{{email}}/g, email)
      .replace(/{{position}}/g, position)
      .replace(/{{experience}}/g, experience_years)
      .replace(/{{location}}/g, location)
      .replace(/{{notice}}/g, notice_period);

    if (s3Urls.length > 0) {
      adminEmailHtml += `<br><h3>Uploaded Documents:</h3>` +
        s3Urls.map((url, i) => `<p><a href="${url}">Document ${i + 1}</a></p>`).join("");
    }

    await emailService.send_email({
      email_to: process.env.SUPPORT_EMAIL_WEBSITE,
      subject: `New Job Application - ${full_name} for ${position}`,
      body: adminEmailHtml,
    });

    return res.status(200).json({
      success: true,
      message: "Application submitted successfully.",
      data: newApplication,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to submit application",
      error: error.message
    });
  }
};
