import { supabase } from './supabaseClient.js';

// src/utils/storage.js
const DONOR_PHOTOS_BUCKET = 'blood-donors'; // <-- use your real bucket name here
export async function uploadDonorPhoto(file) {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  const fileExtension = file.name.split('.').pop() || 'jpg';
  const safeExtension = fileExtension.toLowerCase();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExtension}`;
  const filePath = `donors/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(DONOR_PHOTOS_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message || 'Failed to upload donor photo.');
  }

  const { data } = supabase.storage
    .from(DONOR_PHOTOS_BUCKET)
    .getPublicUrl(filePath);

  if (!data || !data.publicUrl) {
    throw new Error('Could not generate public URL for donor photo.');
  }

  return data.publicUrl;
}

