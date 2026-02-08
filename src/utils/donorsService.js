import { supabase } from './supabaseClient.js';

/** Minimum days between whole blood donations (e.g. Indian standard). */
export const DONATION_INTERVAL_DAYS = 56;

/**
 * Effective availability: use admin override if set, else derive from last_donated.
 * @param {{ availableToDonate?: boolean | null; lastDonated?: string | null }} donor
 * @returns {boolean}
 */
export function isAvailableToDonate(donor) {
  if (donor.availableToDonate !== null && donor.availableToDonate !== undefined) {
    return donor.availableToDonate === true;
  }
  if (!donor.lastDonated) return true;
  const last = new Date(donor.lastDonated);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  last.setHours(0, 0, 0, 0);
  const daysSince = Math.floor((today - last) / (24 * 60 * 60 * 1000));
  return daysSince >= DONATION_INTERVAL_DAYS;
}

/**
 * Next eligible date (56 days after last_donated), or null if already eligible / no last_donated.
 * @param {{ lastDonated?: string | null }} donor
 * @returns {string | null} ISO date string or null
 */
export function getNextEligibleDate(donor) {
  if (!donor.lastDonated) return null;
  const last = new Date(donor.lastDonated);
  last.setDate(last.getDate() + DONATION_INTERVAL_DAYS);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  last.setHours(0, 0, 0, 0);
  if (last <= today) return null;
  return last.toISOString().slice(0, 10);
}

const DONOR_SELECT =
  'id, name, blood_group, district, phone, weight, photo_url, last_donated, available_to_donate';

function mapRowToDonor(row) {
  return {
    id: row.id,
    name: row.name?.trim() ?? '',
    bloodGroup: row.blood_group?.toUpperCase() ?? '',
    district: row.district?.trim() ?? '',
    phone: row.phone?.trim() ?? '',
    weight: row.weight ?? null,
    photoUrl: row.photo_url ?? '',
    lastDonated: row.last_donated ?? null,
    availableToDonate: row.available_to_donate ?? null,
  };
}

/**
 * Fetch a single page of donors with optional filters. For public listing pagination.
 * @param {{ page: number; pageSize: number; bloodGroup?: string; district?: string }} opts
 * @returns {{ donors: Array; total: number }}
 */
export async function fetchDonorsPage({ page, pageSize, bloodGroup, district }) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('donors')
    .select(DONOR_SELECT, { count: 'exact' })
    .order('name', { ascending: true });

  if (bloodGroup && bloodGroup !== 'all') {
    query = query.eq('blood_group', bloodGroup);
  }
  if (district && district !== 'all') {
    query = query.eq('district', district);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(error.message || 'Failed to fetch donors from Supabase.');
  }

  const total = count ?? 0;
  const donors = (data ?? []).map(mapRowToDonor);
  return { donors, total };
}

/** Fetch all donors (no pagination). Used by admin. */
export async function fetchDonors() {
  const { data, error } = await supabase
    .from('donors')
    .select(DONOR_SELECT)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message || 'Failed to fetch donors from Supabase.');
  }

  return (data ?? []).map(mapRowToDonor);
}

