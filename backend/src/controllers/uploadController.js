import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

// Upload audio file to Cloudinary
export const uploadAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Convert buffer to stream
    const stream = Readable.from(req.file.buffer);

    // Upload to Cloudinary with audio settings
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video", // Use 'video' for audio files
          folder: "spotify-clone/audio",
          format: "mp3",
          transformation: [{ audio_codec: "mp3", audio_frequency: 44100 }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.pipe(uploadStream);
    });

    res.json({
      message: "Audio uploaded successfully",
      url: result.secure_url,
      public_id: result.public_id,
      duration: result.duration,
      format: result.format,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Upload image (cover art) to Cloudinary
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const stream = Readable.from(req.file.buffer);

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "spotify-clone/images",
          transformation: [
            { width: 640, height: 640, crop: "fill", quality: "auto" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.pipe(uploadStream);
    });

    res.json({
      message: "Image uploaded successfully",
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete file from Cloudinary
export const deleteFile = async (req, res) => {
  try {
    const { public_id, resource_type = "image" } = req.body;

    if (!public_id) {
      return res.status(400).json({ error: "public_id is required" });
    }

    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: resource_type,
    });

    res.json({
      message: "File deleted successfully",
      result,
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get signed upload URL (for frontend direct upload)
export const getUploadSignature = async (req, res) => {
  try {
    const { folder = "spotify-clone", resource_type = "image" } = req.body;

    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
        resource_type,
      },
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
    });
  } catch (error) {
    console.error("Signature error:", error);
    res.status(500).json({ error: error.message });
  }
};
