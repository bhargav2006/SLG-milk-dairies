/**
 * Client-side Image Compression Utility
 * Resizes and compresses image files (e.g., UPI payment proof screenshots, product images)
 * in the browser before sending them as Base64 strings to MongoDB.
 *
 * @param {File} file - The image File object from file input or drag-and-drop.
 * @param {Object} [options] - Compression configuration options.
 * @param {number} [options.maxDim=800] - Maximum width/height boundary (default 800px).
 * @param {number} [options.quality=0.7] - Quality factor between 0.1 and 1.0 (default 0.7).
 * @returns {Promise<string>} Promise that resolves to the compressed Base64 JPEG Data URL string.
 */
export const compressImage = (file, options = {}) => {
  const maxDim = options.maxDim || 800;
  const quality = options.quality !== undefined ? options.quality : 0.7;

  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      return reject(new Error("Please select a valid image file."));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedBase64);
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => reject(new Error("Failed to load image element."));
      img.src = event.target.result;
    };

    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
};
