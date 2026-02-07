import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient.js';
import { fetchDonors } from '../utils/donorsService.js';
import { BLOOD_GROUPS, KERALA_DISTRICTS } from '../utils/options.js';
import { uploadDonorPhoto } from '../utils/storage.js';
import { AdminUsers } from './AdminUsers.jsx';

export function AdminDonors({ isSuperAdmin }) {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [photoUploadError, setPhotoUploadError] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [activeDonorId, setActiveDonorId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBlood, setFilterBlood] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [activeView, setActiveView] = useState('form'); // 'form' | 'list' | 'admins'

  const [form, setForm] = useState({
    name: '',
    blood_group: '',
    district: '',
    phone: '',
    weight: '',
    photo_url: '',
    last_donated: '',
  });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const list = await fetchDonors();
      setDonors(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load donors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      name: '',
      blood_group: '',
      district: '',
      phone: '',
      weight: '',
      photo_url: '',
      last_donated: '',
    });
    setActiveDonorId(null);
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setError('');

    const payload = {
      name: form.name,
      blood_group: form.blood_group,
      district: form.district,
      phone: form.phone,
      weight: form.weight ? Number(form.weight) : null,
      photo_url: form.photo_url || null,
      last_donated: form.last_donated || null,
    };

    if (activeDonorId) {
      const { error: updateError } = await supabase
        .from('donors')
        .update(payload)
        .eq('id', activeDonorId);

      if (updateError) {
        setError(updateError.message || 'Failed to update donor.');
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from('donors')
        .insert(payload);

      if (insertError) {
        setError(insertError.message || 'Failed to create donor.');
        return;
      }
    }

    resetForm();
    await load();
  };

  const handleDelete = async (donorId) => {
    setError('');
    const { error: deleteError } = await supabase
      .from('donors')
      .delete()
      .eq('id', donorId);

    if (deleteError) {
      setError(deleteError.message || 'Failed to delete donor.');
      return;
    }

    if (activeDonorId === donorId) {
      resetForm();
    }

    await load();
  };

  const handlePhotoFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoUploadError('');
    setUploadingPhoto(true);
    try {
      const publicUrl = await uploadDonorPhoto(file);
      setForm((previous) => ({
        ...previous,
        photo_url: publicUrl,
      }));
    } catch (err) {
      setPhotoUploadError(
        err instanceof Error ? err.message : 'Failed to upload photo.',
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSelectDonor = (donor) => {
    setActiveDonorId(donor.id);
    setForm({
      name: donor.name,
      blood_group: donor.bloodGroup,
      district: donor.district,
      phone: donor.phone,
      weight: donor.weight ?? '',
      photo_url: donor.photoUrl ?? '',
      last_donated: donor.lastDonated ?? '',
    });
  };

  const filteredDonors = donors.filter((donor) => {
    const matchesSearch =
      !searchTerm ||
      donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.phone.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBlood = !filterBlood || donor.bloodGroup === filterBlood;
    const matchesDistrict =
      !filterDistrict || donor.district === filterDistrict;

    return matchesSearch && matchesBlood && matchesDistrict;
  });

  return (
    <div className="admin-panel">
      <h2 className="admin-title">Manage Donors</h2>

      <div className="admin-shell">
        <nav className="admin-nav">
          <button
            type="button"
            className={
              activeView === 'form'
                ? 'admin-nav-button admin-nav-button-active'
                : 'admin-nav-button'
            }
            onClick={() => setActiveView('form')}
          >
            Add / Edit donor
          </button>
          <button
            type="button"
            className={
              activeView === 'list'
                ? 'admin-nav-button admin-nav-button-active'
                : 'admin-nav-button'
            }
            onClick={() => setActiveView('list')}
          >
            All donors
          </button>
          {isSuperAdmin && (
            <button
              type="button"
              className={
                activeView === 'admins'
                  ? 'admin-nav-button admin-nav-button-active'
                  : 'admin-nav-button'
              }
              onClick={() => setActiveView('admins')}
            >
              Manage admins
            </button>
          )}
        </nav>

        <div className="admin-content">
          {activeView === 'form' && (
            <section className="admin-main">
              <form className="admin-form" onSubmit={handleCreate}>
                <div className="admin-fields-row">
                  <label className="admin-label">
                    Name
                    <input
                      className="admin-input"
                      name="name"
                      placeholder="Name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label className="admin-label">
                    Blood group
                    <select
                      className="admin-input"
                      name="blood_group"
                      value={form.blood_group}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select blood group</option>
                      {BLOOD_GROUPS.map((group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="admin-label">
                    District
                    <select
                      className="admin-input"
                      name="district"
                      value={form.district}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select district</option>
                      {KERALA_DISTRICTS.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="admin-fields-row">
                  <label className="admin-label">
                    Phone
                    <input
                      className="admin-input"
                      name="phone"
                      placeholder="Phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label className="admin-label">
                    Weight (kg)
                    <input
                      className="admin-input"
                      name="weight"
                      type="number"
                      min="0"
                      placeholder="Weight (kg)"
                      value={form.weight}
                      onChange={handleChange}
                    />
                  </label>
                </div>

                <div className="admin-fields-row admin-fields-row-bottom">
                  <div className="admin-photo-input-group">
                    <span className="admin-date-label">Photo</span>
                    <input
                      className="admin-input"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoFileChange}
                    />
            {form.photo_url ? (
              <img
                className="admin-photo-preview"
                src={form.photo_url}
                alt={form.name ? `Photo of ${form.name}` : 'Donor photo'}
              />
            ) : null}
                  </div>
                  <div className="admin-date-group">
                    <span className="admin-date-label">Last donation date</span>
                    <input
                      className="admin-input"
                      name="last_donated"
                      type="date"
                      value={form.last_donated}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="admin-submit-wrapper">
                    <button className="admin-button" type="submit">
                      {activeDonorId ? 'Update donor' : 'Add donor'}
                    </button>
                    {activeDonorId && (
                      <button
                        type="button"
                        className="admin-button admin-button-secondary"
                        onClick={resetForm}
                      >
                        Cancel edit
                      </button>
                    )}
                  </div>
                </div>

                {error ? <p className="admin-error">{error}</p> : null}
                {photoUploadError ? (
                  <p className="admin-error">{photoUploadError}</p>
                ) : null}
                {uploadingPhoto ? (
                  <p className="admin-message">Uploading photo…</p>
                ) : null}
              </form>
            </section>
          )}

          {activeView === 'list' && (
            <section className="admin-list-view">
              <div className="admin-sidebar-filters">
                <input
                  className="admin-input admin-input-small"
                  placeholder="Search by name or phone"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
                <div className="admin-fields-row">
                  <select
                    className="admin-input admin-input-small"
                    value={filterBlood}
                    onChange={(event) => setFilterBlood(event.target.value)}
                  >
                    <option value="">All groups</option>
                    {BLOOD_GROUPS.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                  <select
                    className="admin-input admin-input-small"
                    value={filterDistrict}
                    onChange={(event) => setFilterDistrict(event.target.value)}
                  >
                    <option value="">All districts</option>
                    {KERALA_DISTRICTS.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {loading ? (
                <p className="admin-message">Loading donors…</p>
              ) : (
                <ul className="admin-list admin-list-scroll">
                  {filteredDonors.map((donor) => (
                    <li
                      key={donor.id}
                      className="admin-list-item"
                    >
                      <div className="admin-list-item-main">
                        <strong>{donor.name || 'Unnamed donor'}</strong>
                        <span className="admin-list-item-sub">
                          {donor.bloodGroup} · {donor.district}
                        </span>
                      </div>
                      <div className="admin-list-actions">
                        <button
                          type="button"
                          className="admin-list-edit"
                          onClick={() => {
                            handleSelectDonor(donor);
                            setActiveView('form');
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="admin-list-delete"
                          onClick={() => {
                            void handleDelete(donor.id);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                  {filteredDonors.length === 0 && (
                    <li className="admin-list-item">
                      <span className="admin-list-item-sub">
                        No donors match the current filters.
                      </span>
                    </li>
                  )}
                </ul>
              )}
            </section>
          )}

          {activeView === 'admins' && isSuperAdmin && (
            <section className="admin-list-view">
              <AdminUsers />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

