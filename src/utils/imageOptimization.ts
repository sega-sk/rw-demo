// Image optimization utility with encryption for DealerTower CDN
// Falls back to original URLs if optimization fails

export interface EncryptObjectParams {
  width?: number;
  url: string | string[];
  quality?: number;
  cache?: number;
}

/**
 * Encrypted object { width, src, height? } to URL-safe Base64 string
 * using AES-256-CTR.
 */
export async function encryptObject(object: EncryptObjectParams, keyStr: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(object));

  // Derive a 256-bit key from the secret key using SHA-256.
  const keyHash = await crypto.subtle.digest('SHA-256', encoder.encode(keyStr));

  // Import the key for AES-CTR usage.
  const cryptoKey = await crypto.subtle.importKey('raw', keyHash, { name: 'AES-CTR' }, false, ['encrypt', 'decrypt']);

  // Create a fixed 16-byte counter (IV) filled with zeros.
  const iv = new Uint8Array(16);

  // Encrypt the data.
  const encryptedBuffer = await crypto.subtle.encrypt({ name: 'AES-CTR', counter: iv, length: 64 }, cryptoKey, data);

  // Convert the encrypted ArrayBuffer to a binary string.
  const encryptedArray = new Uint8Array(encryptedBuffer);
  let binary = '';
  for (let i = 0; i < encryptedArray.byteLength; i++) {
    binary += String.fromCharCode(encryptedArray[i]);
  }

  // Convert binary string to Base64.
  const base64 = btoa(binary);
  // Convert to URL-safe Base64.
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

interface OptimizedImageOptions {
  src: string;
  width?: number;
  quality?: number;
  cache?: number;
}

export default async function encryptedLoader({ src, width, quality = 80, cache = 1 }: OptimizedImageOptions) {
  // Skip optimization for local development images or already optimized images
  if (!src || src.startsWith('/') || src.includes('dealertower.app/image/') || src.includes('localhost') || src.includes('pexels.com')) {
    return src;
  }

  try {
    const params = { url: src, width, quality, cache };
    const key = import.meta.env.VITE_IMG_KEY || '5defa113-13f3-4287-bc0d-7d4b58e8b832-e1370585-f700-46d2-a780-4d27abc83f41';
    const encrypted = await encryptObject(params, key);
    return `https://dealertower.app/image/${encrypted}.avif`;
  } catch (error) {
    console.warn('Image optimization failed for', src, '- using original URL:', error);
    return src;
  }
}

// Responsive image sizes for different use cases
export const IMAGE_SIZES = {
  thumbnail: { width: 100, quality: 70 },
  small: { width: 300, quality: 75 },
  medium: { width: 600, quality: 80 },
  large: { width: 1200, quality: 85 },
  hero: { width: 1920, quality: 90 },
  card: { width: 500, quality: 80 },
  gallery: { width: 800, quality: 85 },
  fullscreen: { width: 2048, quality: 90 }
};

// Helper function to get optimized image URL with predefined sizes
export async function getOptimizedImageUrl(src: string, size: keyof typeof IMAGE_SIZES): Promise<string> {
  const options = IMAGE_SIZES[size];
  return encryptedLoader({ src, ...options });
}

// Batch optimize multiple images
export async function optimizeImages(images: string[], size: keyof typeof IMAGE_SIZES): Promise<string[]> {
  const promises = images.map(src => getOptimizedImageUrl(src, size));
  return Promise.all(promises);
}