const API_BASE = 'https://pandora-cerebrational-nonoccidentally.ngrok-free.dev';

export const uploadImage = async (uri: string): Promise<string> => {
  try {
    // ✅ Upload to Cloudinary via backend using FormData
    const formData = new FormData();
    formData.append('image', {
      uri,
      type: 'image/jpeg',
      name: 'banner.jpg',
    } as any);

    const response = await fetch(`${API_BASE}/api/banners/upload`, {
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
    
    // ✅ Return Cloudinary URL
    return result.imageUrl;
    
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
};
