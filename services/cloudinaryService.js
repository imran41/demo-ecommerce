export const cloudinaryService = {
  isCloudinaryConfigured: !!(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME !== 'your-cloudinary-cloud-name' &&
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET &&
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET !== 'your-cloudinary-upload-preset' &&
    !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME.includes('placeholder')
  ),

  async uploadImage(file) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (this.isCloudinaryConfigured) {
      // Real Cloudinary Upload via API
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
      // Mock File Upload (Convert to Base64 + Compress to prevent LocalStorage Quota Exceeded)
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new window.Image();
          img.src = event.target.result;
          img.onload = () => {
            // Resize calculation
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 400;
            const MAX_HEIGHT = 405;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height = Math.round(height * (MAX_WIDTH / width));
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width = Math.round(width * (MAX_HEIGHT / height));
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Compress to JPEG with 0.6 quality (typically drops size from 4MB to ~25KB)
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
            
            setTimeout(() => {
              resolve(compressedDataUrl);
            }, 600);
          };
          img.onerror = () => {
            reject(new Error('Failed to load image for resizing'));
          };
        };
        reader.onerror = (error) => {
          console.error('Mock FileReader error:', error);
          reject(new Error('Image processing failed'));
        };
      });
    }
  },

  async uploadMultipleImages(files) {
    // files can be an Array or FileList
    const fileArray = Array.from(files);
    const uploadPromises = fileArray.map(file => this.uploadImage(file));
    return Promise.all(uploadPromises);
  }
};
