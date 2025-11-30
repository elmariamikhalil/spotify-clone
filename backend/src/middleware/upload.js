import multer from "multer";

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// File filter for audio files
const audioFilter = (req, file, cb) => {
  const allowedMimes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg"];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only MP3, WAV, and OGG files are allowed."),
      false
    );
  }
};

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, and WebP images are allowed."
      ),
      false
    );
  }
};

// Upload middleware for audio files (max 10MB)
export const uploadAudio = multer({
  storage,
  fileFilter: audioFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
}).single("audio");

// Upload middleware for images (max 5MB)
export const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
}).single("image");
