import * as ImagePicker from 'expo-image-picker';

interface UploadedProductImage {
  url: string;
  publicId: string;
}

export const uploadProductImage = async (imageUri: string): Promise<UploadedProductImage> => {
  try {
    console.log('📤 Starting product image upload to backend...');
    
    // Create form data for backend upload
    const formData = new FormData();
    
    // Append file properly for React Native
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    const fileName = `product-image.${fileType}`;
    
    formData.append('file', {
      uri: imageUri,
      type: `image/${fileType}`,
      name: fileName,
    } as any);
    
    console.log('📤 Upload details:', {
      uri: imageUri,
      type: `image/${fileType}`,
      name: fileName
    });
    
    // Upload to backend (which will handle Cloudinary)
    const response = await fetch(
      'https://campus-suit-szub.onrender.com/api/upload',
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log('📤 Response status:', response.status);
    console.log('📤 Response headers:', response.headers);

    const responseText = await response.text();
    console.log('📤 Raw response:', responseText);

    // Check if response is HTML (error page) instead of JSON
    if (responseText.trim().startsWith('<')) {
      console.error('❌ Received HTML instead of JSON - possible routing error');
      throw new Error('Server returned HTML instead of JSON. Check backend routing.');
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      console.error('❌ Response that failed to parse:', responseText);
      throw new Error('Invalid JSON response from server');
    }

    if (!response.ok) {
      console.error('❌ Backend upload failed:', data);
      throw new Error(data.error?.message || 'Failed to upload image to backend');
    }

    console.log('✅ Product image uploaded successfully!');
    console.log('🔗 URL:', data.fileUrl);
    console.log('🆔 Public ID:', data.publicId);

    return {
      url: data.fileUrl,
      publicId: data.publicId,
    };
  } catch (error) {
    console.error('❌ Error uploading product image:', error);
    throw error;
  }
};

export const pickAndUploadProductImage = async (): Promise<UploadedProductImage | null> => {
  try {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access camera roll is required');
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      console.log('📷 Image selection cancelled');
      return null;
    }

    const imageUri = result.assets[0].uri;
    console.log('📷 Image selected:', imageUri);

    // Upload to backend
    return await uploadProductImage(imageUri);
  } catch (error) {
    console.error('❌ Error in pick and upload process:', error);
    throw error;
  }
};
