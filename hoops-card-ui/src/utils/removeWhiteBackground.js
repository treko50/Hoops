/**
 * Remove white background from player images
 * Uses canvas to detect and remove white/light pixels
 */

import { useState, useEffect } from 'react';

/**
 * Process image to remove white background
 * @param {string} imageUrl - URL of the image to process
 * @param {number} threshold - Brightness threshold (0-255, higher = more aggressive)
 * @returns {Promise<string>} - Data URL of processed image
 */
export async function removeWhiteBackground(imageUrl, threshold = 240) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Process pixels - make white/light pixels transparent
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Calculate brightness
          const brightness = (r + g + b) / 3;

          // If pixel is white/light, make it transparent
          if (brightness > threshold) {
            // Calculate how close to white (for smooth edges)
            const whiteness = (brightness - threshold) / (255 - threshold);
            data[i + 3] = Math.max(0, data[i + 3] * (1 - whiteness));
          }
          // For near-white pixels, reduce opacity
          else if (brightness > threshold - 30) {
            const nearWhiteness = (brightness - (threshold - 30)) / 30;
            data[i + 3] = data[i + 3] * (1 - nearWhiteness * 0.5);
          }
        }

        // Put processed image data back
        ctx.putImageData(imageData, 0, 0);

        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      } catch (error) {
        console.error('Error processing image:', error);
        // Return original URL if processing fails
        resolve(imageUrl);
      }
    };

    img.onerror = () => {
      console.error('Error loading image:', imageUrl);
      // Return original URL if loading fails
      resolve(imageUrl);
    };

    img.src = imageUrl;
  });
}

/**
 * React hook for processing player images
 * @param {string} imageUrl - URL of the image
 * @param {number} threshold - Brightness threshold
 * @returns {string|null} - Processed image URL or null if loading
 */
export function useProcessedImage(imageUrl, threshold = 240) {
  const [processedUrl, setProcessedUrl] = useState(null);

  useEffect(() => {
    if (!imageUrl) {
      setProcessedUrl(null);
      return;
    }

    removeWhiteBackground(imageUrl, threshold)
      .then(url => setProcessedUrl(url))
      .catch(err => {
        console.error('Failed to process image:', err);
        setProcessedUrl(imageUrl); // Fallback to original
      });
  }, [imageUrl, threshold]);

  return processedUrl;
}
