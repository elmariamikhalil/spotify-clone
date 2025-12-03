import crypto from 'crypto';
global.crypto = crypto;
import { BlobServiceClient } from '@azure/storage-blob';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'spotify-files';

if (!connectionString) {
  console.error('⚠️ Azure Storage connection string not found');
}

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);

async function ensureContainer() {
  try {
    const exists = await containerClient.exists();
    if (!exists) {
      await containerClient.create({
        access: 'blob'
      });
      console.log(`✅ Created Azure container: ${containerName}`);
    } else {
      console.log(`✅ Azure Blob Storage connected: ${containerName}`);
    }
  } catch (error) {
    console.error('❌ Error with Azure container:', error.message);
  }
}

ensureContainer();

export { containerClient, blobServiceClient, containerName };
