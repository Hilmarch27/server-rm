import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Navigasi satu tingkat di atas dan menuju ke direktori uploads
const uploadDir = path.join(__dirname, "../uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
    console.log("Destination set to:", uploadDir); // Logging untuk menampilkan destinasi penyimpanan
  },
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
    console.log("File uploaded with filename:", fileName); // Logging untuk menampilkan nama file yang diunggah
  },
});

const upload = multer({ storage });

export const uploadFields = (fields) => {
  console.log("Setting upload fields:", fields); // Logging untuk menampilkan konfigurasi fields upload
  return upload.fields(fields);
};

export default upload;
