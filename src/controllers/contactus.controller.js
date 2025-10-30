const path = require("path");
const fs = require("fs");
const useragent = require("useragent");
const Email_Service = require("../services/email.service");
const ContactUs_Service = require("../database/models/contactus.model");

exports.create = async (req, res) => {
  try {
    const { full_name, phone_number, email_id, organization, subject, inquiry_details } = req.body;

    // Parse Device Info
    const agent = useragent.parse(req.headers['user-agent']);
    const isMobile = agent.os.toString().includes('Android') || agent.os.toString().includes('iOS');
    const device_info = isMobile ? 'Mobile' : 'Web Browser: ' + agent.toString();
    const platform = isMobile ? 'Mobile Device' : 'Desktop Browser';

    // Referrer
    let referrer = req.headers['referer'] || 'Direct';

    // Capture IP
    let request_ipv4 = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;

    // Insert Record
    const newRecord = await ContactUs_Service.create({
      full_name, phone_number, email_id,
      organization, subject, inquiry_details,
      referrer, platform, device_info, request_ipv4,
      query_date: new Date()
    });

    // ===== ✅ ONLY ADMIN EMAIL (USER EMAIL REMOVED) =====
    const adminTemplatePath = path.join(__dirname, "../views/email_templates/contact_us_admin.html");
    let adminTemplate = fs.readFileSync(adminTemplatePath, "utf8");

    const adminEmailBody = adminTemplate
      .replace(/#app_name#/g, process.env.APP_NAME || 'SPPL')
      .replace(/#full_name#/g, full_name)
      .replace(/#email#/g, email_id)
      .replace(/#phone#/g, phone_number)
      .replace(/#organization#/g, organization || 'Not Provided')
      .replace(/#subject#/g, subject)
      .replace(/#inquiry_details#/g, inquiry_details);

    await Email_Service.send_email({
      email_to: process.env.SUPPORT_EMAIL_WEBSITE,
      subject: `New Inquiry - ${process.env.APP_NAME}`,
      body: adminEmailBody,
    });

    return res.status(200).json({
      success: true,
      message: 'Thank you for contacting us. Our team will reach out to you soon.',
      data: newRecord
    });

  } catch (error) {
    console.error("Error in Contact Us Controller:", error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};
