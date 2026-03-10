import { Alert } from 'react-native';

const API_BASE = 'https://campus-suit-szub.onrender.com';

export interface UploadedLoanAdminDocument {
  uri: string;
  name: string;
  type: string | null;
  size: number;
  cloudinaryUrl?: string;
  publicId?: string;
}

export const uploadLoanAdminDocumentToCloudinary = async (file: UploadedLoanAdminDocument): Promise<UploadedLoanAdminDocument> => {
  try {
    console.log(`📤 Uploading loan admin document: ${file.name} to Cloudinary...`);
    console.log(`📁 File URI: ${file.uri}`);
    console.log(`📄 File type: ${file.type}`);
    console.log(`📏 File size: ${file.size} bytes`);
    
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type || 'application/pdf',
      name: file.name,
    } as any);

    console.log('🌐 Sending request to:', `${API_BASE}/api/upload`);

    const response = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('📡 Response status:', response.status);

    const result = await response.json();
    console.log('📋 Upload response:', result);
    
    if (!result.success) {
      throw new Error(result.message || 'Upload failed');
    }
    
    console.log(`✅ Loan admin document uploaded successfully: ${file.name}`);
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
