import { cloudinaryConfig } from '../config/cloudinary';

export const uploadService = {
  uploadMedia: async (file) => {
    if (!file) return { url: null, type: 'text' };
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryConfig.uploadPreset);
    
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/auto/upload`, {
      method: "POST",
      body: formData
    });
    
    const data = await response.json();
    return {
      url: data.secure_url,
      type: data.resource_type // 'image' or 'video'
    };
  }
};
