const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads/chat");
    },

    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const unique = `${file.fieldname}-${Date.now()}${ext}`;
        cb(null, unique);
    }
});

const fileFilter = (req, file, cb) => {

    const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx"];

    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    const ext = path.extname(file.originalname).toLowerCase();

    if (
        allowedExtensions.includes(ext) &&
        allowedMimeTypes.includes(file.mimetype)
    ) {
        cb(null, true);
    } else {
        cb(new Error("Only JPG, JPEG, PNG, PDF, DOC and DOCX files are allowed."), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

module.exports = upload;