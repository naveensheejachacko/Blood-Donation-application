const ALL_VALUE = 'all';

export function getUniqueBloodGroups(donors) {
  const values = new Set();

  donors.forEach((donor) => {
    if (donor.bloodGroup) {
      values.add(donor.bloodGroup);
    }
  });

  return Array.from(values).sort((a, b) => a.localeCompare(b));
}

export function getUniqueDistricts(donors) {
  const values = new Set();

  donors.forEach((donor) => {
    if (donor.district) {
      values.add(donor.district);
    }
  });

  return Array.from(values).sort((a, b) => a.localeCompare(b));
}

export function filterDonors(donors, { bloodGroup, district }) {
  const normalisedBloodGroup =
    bloodGroup && bloodGroup !== ALL_VALUE ? bloodGroup : null;
  const normalisedDistrict =
    district && district !== ALL_VALUE ? district : null;

  if (!normalisedBloodGroup && !normalisedDistrict) {
    return donors;
  }

  return donors.filter((donor) => {
    if (
      normalisedBloodGroup &&
      donor.bloodGroup.toUpperCase() !== normalisedBloodGroup.toUpperCase()
    ) {
      return false;
    }

    if (
      normalisedDistrict &&
      donor.district.toLowerCase() !== normalisedDistrict.toLowerCase()
    ) {
      return false;
    }

    return true;
  });
}

