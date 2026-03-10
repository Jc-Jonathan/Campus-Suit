import { Alert } from 'react-native';

const API_BASE = 'https://pandora-cerebrational-nonoccidentally.ngrok-free.dev';

export interface UploadedDocument {
  uri: string;
  name: string;
  type: string | null;
  size: number;
  cloudinaryUrl?: string;
  publicId?: string;
}

export const uploadDocumentToCloudinary = async (file: UploadedDocument): Promise<UploadedDocument> => {
  try {
    console.log(`📤 Uploading document: ${file.name} to Cloudinary...`);
    
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type || 'application/pdf',
      name: file.name,
    } as any);

    const response = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Upload failed');
    }
    
    console.log(`✅ Document uploaded successfully: ${file.name}`);
    console.log(`📄 Cloudinary URL: ${result.fileUrl}`);
    console.log(`🆔 Public ID: ${result.publicId}`);
    
    // Return updated file with Cloudinary data
    return {
      ...file,
      cloudinaryUrl: result.fileUrl,
      publicId: result.publicId,
    };
    
  } catch (error) {
    const errorMessage = `Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(`❌ ${errorMessage}`);
    
    // Show popup error instead of console error
    Alert.alert('Upload Error', errorMessage);
    
    throw new Error(errorMessage);
  }
};
