const ALL_VALUE = 'all';

export function Filters({
  bloodGroupOptions,
  districtOptions,
  selectedBloodGroup,
  selectedDistrict,
  onBloodGroupChange,
  onDistrictChange,
  onReset,
}) {
  const handleBloodGroupChange = (event) => {
    onBloodGroupChange(event.target.value);
  };

  const handleDistrictChange = (event) => {
    onDistrictChange(event.target.value);
  };

  return (
    <div className="filters">
      <div className="filters-group">
        <label className="filters-label" htmlFor="blood-group-filter">
          Blood group
        </label>
        <select
          id="blood-group-filter"
          className="filters-select"
          value={selectedBloodGroup}
          onChange={handleBloodGroupChange}
        >
          <option value={ALL_VALUE}>All blood groups</option>
          {bloodGroupOptions.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
      </div>

      <div className="filters-group">
        <label className="filters-label" htmlFor="district-filter">
          District
        </label>
        <select
          id="district-filter"
          className="filters-select"
          value={selectedDistrict}
          onChange={handleDistrictChange}
        >
          <option value={ALL_VALUE}>All districts</option>
          {districtOptions.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
      </div>

      <div className="filters-actions">
        <button
          type="button"
          className="filters-reset-button"
          onClick={onReset}
        >
          Reset filters
        </button>
      </div>
    </div>
  );
}

