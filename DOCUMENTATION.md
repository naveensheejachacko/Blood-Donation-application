# Blood Donation Directory — Documentation

## Overview

Blood Donation Directory is a public donor directory for Kerala, India. Visitors can browse donors by blood group and district. Administrators and super administrators manage donor data and (for super admins only) other admins via a protected admin portal. Data is stored in **Supabase** (PostgreSQL + Storage + Auth); the frontend is a static React app deployable on GitHub Pages.

---

## Tech Stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Frontend     | React 18, Vite 5                    |
| Styling      | Plain CSS (no Tailwind/UI library)  |
| Backend/DB   | Supabase (PostgreSQL, Auth, Storage)|
| Hosting      | GitHub Pages (or any static host)   |

---

## Project Structure

```
blood donation app/
├── index.html
├── vite.config.js
├── .env                    # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── DOCUMENTATION.md        # This file
├── README.md
└── src/
    ├── main.jsx            # React root, global styles
    ├── App.jsx             # Routing (hash), session, public vs admin views
    ├── components/
    │   ├── Layout.jsx      # Page shell
    │   ├── Filters.jsx     # Public: blood group & district filters
    │   ├── DonorList.jsx   # Public: loading/error/list of DonorCards
    │   ├── DonorCard.jsx   # Public: single donor card (photo, name, blood, district, phone, weight, last donated)
    │   ├── AdminLogin.jsx  # Admin login form (#/blood-kochi-login)
    │   ├── AdminRegister.jsx # Admin registration (#/blood-kochi-register)
    │   ├── AdminDonors.jsx # Admin portal: Add/Edit, All donors, Manage admins (tabs)
    │   └── AdminUsers.jsx  # Super-admin only: list admins, block/unblock, make super/regular
    ├── utils/
    │   ├── supabaseClient.js  # Supabase client (env-based)
    │   ├── donorsService.js   # Fetch donors from Supabase
    │   ├── filters.js         # Client-side filter helpers
    │   ├── phone.js           # Mask phone number
    │   ├── storage.js         # Upload donor photo to Supabase Storage
    │   └── options.js         # BLOOD_GROUPS, KERALA_DISTRICTS constants
    └── styles/
        ├── globals.css
        ├── layout.css
        └── donors.css        # Filters, cards, admin panel, nav
```

---

## Environment Variables

Create a `.env` file in the project root (do not commit secrets; `.env` is typically in `.gitignore`):

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key
```

- **VITE_SUPABASE_URL**: From Supabase Dashboard → Settings → API → Project URL.
- **VITE_SUPABASE_ANON_KEY**: From Supabase Dashboard → Settings → API → Project API keys → `anon` public.

Restart the dev server after changing `.env`.

---

## Supabase Setup

### 1. Donors table

```sql
create table public.donors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  blood_group text not null,
  district text not null,
  phone text not null,
  weight numeric,
  photo_url text,
  last_donated date
);

alter table public.donors enable row level security;

create policy "Public read donors"
on public.donors for select to anon using (true);

create policy "Admins manage donors"
on public.donors for all to authenticated using (true) with check (true);
```

Optional: add `weight` if not present:

```sql
alter table public.donors add column if not exists weight numeric;
```

### 2. Admin profiles (roles + block)

```sql
create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'admin',   -- 'admin' or 'super_admin'
  is_blocked boolean not null default false,
  created_at timestamptz default now()
);

alter table public.admin_profiles enable row level security;

create policy "Admins read profiles"
on public.admin_profiles for select to authenticated using (true);

create policy "Super admins manage profiles"
on public.admin_profiles for all to authenticated
using (
  exists (
    select 1 from public.admin_profiles p
    where p.user_id = auth.uid() and p.role = 'super_admin' and p.is_blocked = false
  )
)
with check (
  exists (
    select 1 from public.admin_profiles p
    where p.user_id = auth.uid() and p.role = 'super_admin' and p.is_blocked = false
  )
);
```

After the first user signs up via the app, add them as super admin (replace with real `user_id` and `email` from Auth or from `admin_profiles` after one insert):

```sql
insert into public.admin_profiles (user_id, email, role, is_blocked)
values ('<user_id_from_auth_users>', 'superadmin@example.com', 'super_admin', false);
```

New admins can register at `/#/blood-kochi-register`. A super admin must then add a row in `admin_profiles` for them (or you can provide an “invite” flow that inserts into `admin_profiles`; the app currently only reads/updates existing rows).

### 3. Storage bucket (donor photos)

- Create a bucket, e.g. **blood-donors** (or **donor-photos**; the app uses a constant in `src/utils/storage.js` — ensure the name matches).
- Make the bucket **public** so donor images can be shown on the public site.
- Add policies, for example:

```sql
-- Authenticated admins can upload
create policy "Admins upload donor photos"
on storage.objects for insert to authenticated
with check (bucket_id = 'blood-donors');

-- Anyone can read (for public directory)
create policy "Public read donor photos"
on storage.objects for select to anon
using (bucket_id = 'blood-donors');
```

Update `src/utils/storage.js` so `DONOR_PHOTOS_BUCKET` matches your bucket id (e.g. `'blood-donors'`).

---

## URLs and Access

| URL / Hash              | Who can access        | Purpose |
| ----------------------- | --------------------- | ------- |
| `/` or `/#/`            | Everyone              | Public donor directory |
| `/#/blood-kochi-login`  | Anyone (no link in UI) | Admin login |
| `/#/blood-kochi-register` | Anyone (no link in UI) | Admin registration |
| `/#/admin`              | Logged-in admins      | Admin portal (donors +, for super admin, admins) |

Admin and register URLs are “hidden” (no navigation links); only people who know the URL can open them. After login, the app redirects to `/#/admin`.

---

## Roles

- **Admin**  
  - Can use **Add / Edit donor** and **All donors** in the admin portal.  
  - Cannot see or use **Manage admins**.

- **Super admin**  
  - Same as admin, plus **Manage admins** tab: list all `admin_profiles`, **Block/Unblock**, **Make super admin** / **Make regular admin**.

The app treats a user as super admin only if `admin_profiles.role = 'super_admin'` and `admin_profiles.is_blocked = false`. The first super admin is created manually in the database.

---

## Admin Portal (/#/admin)

After logging in at `/#/blood-kochi-login`, the user lands on the admin portal. A **Logout** button appears in the header.

### Tabs (sidebar)

1. **Add / Edit donor**  
   Form: name, blood group, district, phone, weight (optional), photo (file upload to Supabase Storage), last donation date.  
   - **Add donor**: submit creates a new row in `donors`.  
   - **Update donor**: select a donor from “All donors” (Edit), then submit to update.  
   - Photo preview is shown when editing or after upload.

2. **All donors**  
   Search (name/phone), filters (blood group, district), list of donors with **Edit** (opens form and switches to Add/Edit tab) and **Delete**.

3. **Manage admins** (super admin only)  
   List of `admin_profiles` with email, role, blocked status. Actions: toggle **Block/Unblock**, toggle **Make super admin** / **Make regular admin**.

Session is restored on refresh via Supabase Auth (no need to log in again until session expires or user logs out).

---

## Public Directory

- **Filters**: Blood group (fixed list: A+, A-, B+, B-, AB+, AB-, O+, O-) and District (Kerala’s 14 districts). Reset clears both.
- **Donor cards**: Photo (or placeholder if missing), name, blood group badge, district, masked phone, weight (if present), last donation date.
- Data is read from Supabase `donors` table; filtering is client-side.

---

## Deployment (e.g. GitHub Pages)

1. Set the Vite base path in `vite.config.js` to your repo name:
   ```js
   base: process.env.NODE_ENV === 'production' ? '/your-repo-name/' : '/',
   ```
2. Build: `npm run build`.
3. Deploy the contents of `dist/` to GitHub Pages (branch or Actions).

The same `.env` variables must be available at build time if you use env-based config (e.g. Supabase URL/key are baked into the build). For GitHub Pages, use repository or environment secrets in your workflow and pass them as `VITE_*` build args.

---

## Summary of Key Files

| File | Purpose |
|------|--------|
| `App.jsx` | Hash routing, session restore, admin profile load, `isSuperAdmin`, public vs admin views, logout |
| `AdminDonors.jsx` | Tabs: Add/Edit donor, All donors, Manage admins (if super admin); donor CRUD and list |
| `AdminUsers.jsx` | Super-admin: list and update `admin_profiles` (role, is_blocked) |
| `donorsService.js` | `fetchDonors()` — reads from Supabase `donors` |
| `storage.js` | `uploadDonorPhoto(file)` — uploads to Supabase Storage, returns public URL |
| `options.js` | `BLOOD_GROUPS`, `KERALA_DISTRICTS` for dropdowns |

This documentation reflects the current behaviour of the Blood Donation Directory app (Supabase-backed, admin/super admin roles, donor CRUD, and photo uploads).
