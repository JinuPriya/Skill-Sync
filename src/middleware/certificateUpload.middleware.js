const multer = require("multer")
const path = require("path")

const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, "public/uploads/certificates")
    },

    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const unique = `${file.fieldname}-${Date.now()}${ext}`;
        cb(null, unique);
    }
})

const fileFilter = (req, file, cb) => {
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf"];

    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "application/pdf",
    ]

    const ext = path.extname(file.originalname).toLowerCase();
    
    if(
        allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)
    ) {
        cb(null, true)
    } 
    else{
        cb(new Error("Only JPG, PNG and PDF files are allowed.", false))
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
})

module.exports = upload;