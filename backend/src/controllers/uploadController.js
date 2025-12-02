import { containerClient } from "../config/azureStorage.js";
import { v4 as uuidv4 } from "uuid";

// Upload audio file to Azure Blob Storage
export const uploadAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    const fileExtension = req.file.originalname.split(".").pop();
    const fileName = `audio/${uuidv4()}.${fileExtension}`;
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    await blockBlobClient.uploadData(req.file.buffer, {
      blobHTTPHeaders: {
        blobContentType: req.file.mimetype,
        blobCacheControl: "public, max-age=31536000",
      },
    });

    const fileUrl = blockBlobClient.url;

    res.json({
      url: fileUrl,
      message: "Audio uploaded successfully",
      fileName: fileName,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload audio file" });
  }
};

// Upload image file to Azure Blob Storage
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const fileExtension = req.file.originalname.split(".").pop();
    const fileName = `images/${uuidv4()}.${fileExtension}`;
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    await blockBlobClient.uploadData(req.file.buffer, {
      blobHTTPHeaders: {
        blobContentType: req.file.mimetype,
        blobCacheControl: "public, max-age=31536000",
      },
    });

    const fileUrl = blockBlobClient.url;

    res.json({
      url: fileUrl,
      message: "Image uploaded successfully",
      fileName: fileName,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload image file" });
  }
};

// Delete file from Azure Blob Storage
export const deleteFile = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "File URL required" });
    }

    const urlParts = url.split("/");
    const containerIndex = urlParts.indexOf(
      process.env.AZURE_STORAGE_CONTAINER_NAME || "spotify-files"
    );
    const fileName = urlParts.slice(containerIndex + 1).join("/");

    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    await blockBlobClient.deleteIfExists();

    res.json({
      message: "File deleted successfully",
      fileName: fileName,
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
};

// Get upload signature (for client-side uploads if needed)
export const getUploadSignature = async (req, res) => {
  try {
    res.json({
      message: "Server-side upload only",
      uploadUrl: "/api/upload/audio or /api/upload/image",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
