import { maskPhoneNumber } from '../utils/phone.js';

const FALLBACK_PHOTO_URL =
  'https://via.placeholder.com/320x200.png?text=Donor+Photo';

export function DonorCard({ donor }) {
  const {
    name,
    bloodGroup,
    district,
    phone,
    weight,
    photoUrl,
    lastDonated,
  } = donor;

  const maskedPhone = maskPhoneNumber(phone);
  const displayPhotoUrl = photoUrl || FALLBACK_PHOTO_URL;
  const lastDonatedLabel = lastDonated
    ? `Last donated: ${lastDonated}`
    : 'Last donation date not provided';

  return (
    <article className="donor-card">
      <div className="donor-card-photo-wrapper">
        <img
          className="donor-card-photo"
          src={displayPhotoUrl}
          alt={name ? `Photo of ${name}` : 'Donor photo'}
          loading="lazy"
        />
        <div className="donor-card-badge">
          <span className="donor-card-badge-label">Blood group</span>
          <span className="donor-card-badge-value">{bloodGroup}</span>
        </div>
      </div>

      <div className="donor-card-body">
        <h2 className="donor-card-name">{name || 'Unnamed donor'}</h2>
        <p className="donor-card-detail">
          <span className="donor-card-detail-label">District:</span>{' '}
          <span className="donor-card-detail-value">
            {district || 'Not specified'}
          </span>
        </p>
        {typeof weight === 'number' && !Number.isNaN(weight) ? (
          <p className="donor-card-detail">
            <span className="donor-card-detail-label">Weight:</span>{' '}
            <span className="donor-card-detail-value">
              {weight} kg
            </span>
          </p>
        ) : null}
        <p className="donor-card-detail">
          <span className="donor-card-detail-label">Phone:</span>{' '}
          <span className="donor-card-detail-value">
            {maskedPhone || 'Not provided'}
          </span>
        </p>
        <p className="donor-card-detail donor-card-detail-subtle">
          {lastDonatedLabel}
        </p>
      </div>
    </article>
  );
}

