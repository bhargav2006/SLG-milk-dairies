const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/products");
  },

  filename(req, file, cb) {
    const serialNumber =
      req.body.serialNumber?.trim().replace(/\s+/g, "-") || Date.now();

    let ext = path.extname(file.originalname).toLowerCase();
    if (!ext) {
      if (file.mimetype === "image/png") ext = ".png";
      else if (file.mimetype === "image/webp") ext = ".webp";
      else ext = ".jpg"; // Default fallback for image/jpeg etc
    }

    cb(null, `${serialNumber}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = /image\/(jpeg|jpg|png|webp)/i;
  const allowedExtensions = /\.(jpg|jpeg|png|webp)$/i;

  const hasValidMime = allowedMimeTypes.test(file.mimetype);
  const ext = path.extname(file.originalname);

  // If the file has an extension, verify it. Otherwise, rely on mimetype validation.
  const hasValidExt = ext ? allowedExtensions.test(ext) : true;

  if (hasValidMime && hasValidExt) {
    cb(null, true);
  } else {
    const err = new Error("Only image files (JPG, JPEG, PNG, WEBP) are allowed");
    err.statusCode = 400; // Tag as a 400 Bad Request
    cb(err);
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 5MB limit
});
