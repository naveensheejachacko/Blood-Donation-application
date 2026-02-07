import { supabase } from './supabaseClient.js';

export async function fetchDonors() {
  const { data, error } = await supabase
    .from('donors')
    .select('id, name, blood_group, district, phone, weight, photo_url, last_donated')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message || 'Failed to fetch donors from Supabase.');
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name?.trim() ?? '',
    bloodGroup: row.blood_group?.toUpperCase() ?? '',
    district: row.district?.trim() ?? '',
    phone: row.phone?.trim() ?? '',
    weight: row.weight ?? null,
    photoUrl: row.photo_url ?? '',
    lastDonated: row.last_donated ?? null,
  }));
}

