const router = require("express-promise-router")();
const multer = require('multer')
const path = require('path');

// ------------------------- fieldSize: max size of file in bytes ----------------------------

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/temp'); // Temp location before S3 upload
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/jpg'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  },
  fileFilter: fileFilter
});

//--------------------- Import Controllers -------------------
const ContactUsController = require("../controllers/contactus.controller");
const JobController = require("../controllers/job.controller");
const job_applicants_controller = require("../controllers/job_application.controller");
const share_your_profile = require("../controllers/yourprofile.controller")
const { contactFormLimiter } = require("../database/middleware/rateLimit");

//--------------------- Contact Us API -------------------
router.post("/contactus",contactFormLimiter,ContactUsController.create);

// --------------------- Job API -------------------
router.post("/job/create", JobController.create_job);
router.get("/getall/job", JobController.get_all);
router.get("/job/:id", JobController.get_by_id);
router.patch("/job/update/:id", JobController.stopHiring);

// --------------------- Job Applicants API -------------------
router.post("/apply/job", upload.array("documents", 10),job_applicants_controller.job_apply);

// --------------------- Share Your Profile API -------------------
router.post("/share-your-profile",upload.array("documents"),share_your_profile.share_your_profile);

// --------------------- Health Check / API Version -------------------
router.get('/', (req, res) => {
  res.status(200).json({ 
    success: true,
    version: process.env.APP_VERSION,
    message: `API running successfully` 
  });
});

// ------------------------- Final Setup & 404 Routes ----------------------------
router.get('/', (_request, response) => { response.status(200).json({ message: `API version: ${process.env.APP_VERSION}` }) })
router.use("*", (_request, response) => { response.status(404).json({ message: "API not found" }) })

module.exports = router
