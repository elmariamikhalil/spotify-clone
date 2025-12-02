import { BlobServiceClient } from "@azure/storage-blob";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName =
  process.env.AZURE_STORAGE_CONTAINER_NAME || "spotify-files";

const blobServiceClient =
  BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);

// Create container if it doesn't exist
async function ensureContainer() {
  await containerClient.createIfNotExists({
    access: "blob", // Public read access for files
  });
}

ensureContainer();

export { containerClient, blobServiceClient };
