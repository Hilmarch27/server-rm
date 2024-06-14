import multer from "multer";

// Konfigurasi penyimpanan
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Lokasi penyimpanan file
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname +
        "-" +
        uniqueSuffix +
        "." +
        file.originalname.split(".").pop()
    );
  },
});

// Filter file untuk memastikan hanya gambar yang di-upload
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const limits = {
  fileSize: 1024 * 1024 * 5, // 5 MB
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits,
});

export default upload;