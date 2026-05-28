import { isFirebaseStorageConfigured, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const cloudinaryService = {
  isCloudinaryConfigured: !!(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME !== 'your-cloudinary-cloud-name' &&
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET &&
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET !== 'your-cloudinary-upload-preset' &&
    !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME.includes('placeholder')
  ),

  async uploadImage(file) {
    if (isFirebaseStorageConfigured) {
      try {
        const originalName = file.name ? file.name.replace(/\.[^/.]+$/, "") : 'image';
        const extension = file.name ? file.name.split('.').pop() : 'jpg';
        const fileName = `${Date.now()}_${originalName}.${extension}`;
        
        const fileRef = ref(storage, `products/${fileName}`);
        const snapshot = await uploadBytes(fileRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        return downloadUrl;
      } catch (err) {
        console.error('Firebase Storage upload error:', err);
        throw err;
      }
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (this.isCloudinaryConfigured) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData
          }
        );

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData?.error?.message || 'Failed to upload image to Cloudinary');
        }

        const data = await response.json();
        return data.secure_url;
      } catch (err) {
        console.error('Cloudinary real upload error:', err);
        throw err;
      }
    } else {
      // Mock File Upload fallback (reads raw file to base64)
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = reject;
      });
    }
  },

  async uploadMultipleImages(files) {
    const fileArray = Array.from(files);
    const uploadPromises = fileArray.map(file => this.uploadImage(file));
    return Promise.all(uploadPromises);
  }
};
