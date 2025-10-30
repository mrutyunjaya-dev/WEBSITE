const path = require("path");
const fs = require("fs");
const { Op } = require("sequelize");
const ShareYourProfile = require("../database/models/share_your_profile.model")
const { JOB_TITLES } = require("../constants/job");
const emailService = require("../services/email.service");
const s3Service = require("../services/s3.service");
const moment = require('moment');

exports.share_your_profile = async (req, res) => {
  try {
    let {
      full_name,
      phone,
      email,
      what_describes_you_best,
      YOE,
      highest_qualification,
      current_org,
      location
    } = req.body;

    // Validate required fields
    if (!full_name || !phone || !email || !what_describes_you_best || !YOE || !highest_qualification) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: full_name, phone, email, what_describes_you_best, YOE, highest_qualification"
      });
    }

    // Upload documents to S3
    const files = req.files || [];
    const uploadedUrls = [];

    for (const file of files) {
      const timestamp = Date.now();
      const s3Key = `shared_profiles/${timestamp}_${file.originalname}`;

      const upload = await s3Service.upload_file(
        file.path,
        s3Key,
        process.env.AWS_APPLICATION_ASSETS_S3_BUCKET
      );

      if (upload.success) {
        uploadedUrls.push({
          url: upload.location,
          filename: file.originalname
        });
      }
    }

    // Save to DB
    const newProfile = await ShareYourProfile.create({
      full_name,
      phone,
      email,
      what_describes_you_best,
      YOE,
      highest_qualification,
      current_org: current_org || 'Not Specified',
      location: location || 'Not Specified',
      documents: uploadedUrls
    });

    // Generate timestamp
    const timestamp = moment().format('MMM DD, YYYY hh:mm A');

    // ===== ✅ ONLY ADMIN EMAIL (USER EMAIL REMOVED) =====

    // Build documents HTML for admin
    let documentsHtml = '';
    if (uploadedUrls.length > 0) {
      documentsHtml = uploadedUrls.map((doc, index) => {
        return `
          <div style="background-color:#fff;border:1px solid #e0e0e0;border-radius:6px;padding:12px 15px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;">
            <div style="display:flex;align-items:center;">
              <span style="font-size:24px;margin-right:12px;">📄</span>
              <span style="color:#333;font-size:14px;font-weight:500;">${doc.filename}</span>
            </div>
            <a href="${doc.url}" style="background-color:#2196F3;color:#fff;text-decoration:none;padding:8px 16px;border-radius:4px;font-size:13px;font-weight:600;">
              Download
            </a>
          </div>
        `;
      }).join('');
    } else {
      documentsHtml = '<p style="margin:0;color:#666;font-size:14px;text-align:center;padding:10px;">No documents uploaded</p>';
    }

    const adminTemplatePath = path.join(__dirname, "../views/email_templates/share_profile_admin.html");
    let adminEmailHtml = fs.readFileSync(adminTemplatePath, "utf8")
      .replace(/{{company}}/g, process.env.COMPANY_NAME || 'SPPL')
      .replace(/{{timestamp}}/g, timestamp)
      .replace(/{{name}}/g, full_name)
      .replace(/{{email}}/g, email)
      .replace(/{{phone}}/g, phone)
      .replace(/{{describes_you}}/g, what_describes_you_best)
      .replace(/{{experience}}/g, YOE)
      .replace(/{{qualification}}/g, highest_qualification)
      .replace(/{{current_org}}/g, current_org || 'Not Specified')
      .replace(/{{location}}/g, location || 'Not Specified')
      .replace(/{{documents}}/g, documentsHtml)
      .replace(/{{admin_dashboard_url}}/g, process.env.ADMIN_DASHBOARD_URL || '#');

    await emailService.send_email({
      email_to: process.env.SUPPORT_EMAIL_WEBSITE,
      subject: `👤 New Profile Shared: ${full_name} `,
      body: adminEmailHtml,
    });

    return res.status(200).json({
      success: true,
      message: "Profile submitted successfully. Our team will review it and contact you if shortlisted.",
      data: newProfile
    });

  } catch (error) {
    console.error('Share Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit profile. Please try again.",
      error: error.message
    });
  }
};
