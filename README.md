# Blood Donation Directory

Simple public blood donor directory built with React and Vite. Donor data is
read-only and managed by administrators directly in Google Sheets.

The site is fully static and can be deployed to GitHub Pages.

## Features

- Donor data loaded from a public Google Sheet via the Google Visualization API
- Donors displayed as responsive cards
  - Photo
  - Name
  - Highlighted blood group
  - District
  - Masked phone number
  - Optional last donation date
- Client-side filters
  - Blood group dropdown
  - District dropdown
  - Reset filters
- Clear loading, empty, and error states
- Mobile-first, NGO-friendly design with plain CSS

## 1. Local Setup

### Prerequisites

- Node.js 18.x or newer
- npm 9.x or newer

### Install dependencies

```bash
cd "blood donation app"
npm install
```

### Run the development server

```bash
npm run dev
```

Open the printed local URL in your browser.

### Build for production

```bash
npm run build
```

The static site is generated into the `dist/` folder.

## 2. Google Sheet Setup

This project uses Google Sheets as a simple, admin-managed data store. Public
users only ever see a read-only view.

### 2.1 Create the Sheet

1. Create a new Google Sheet.
2. In the first row, add the following column headers exactly:

   ```text
   id
   name
   blood_group
   district
   phone
   photo_url
   last_donated
   ```

3. Each subsequent row represents one donor.

### 2.2 Make the Sheet Public (View Only)

1. In Google Sheets, go to **Share**.
2. Under **General access**, choose **Anyone with the link**.
3. Set permission to **Viewer**.

This allows the site to read data via the Visualization API without any
credentials or secrets.

### 2.3 Get the Sheet ID

The Sheet ID is the long string in the URL:

```text
https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit#gid=0
```

Copy the value of `<SHEET_ID>`.

### 2.4 Configure the Sheet ID in the App

Open `src/utils/googleSheetsClient.js` and set `SHEET_ID`:

```js
const SHEET_ID = '<GOOGLE_SHEET_ID>'; // replace this placeholder
```

Example:

```js
const SHEET_ID = '1AbCdEfGhIJKlmNoPqRsTuVwXyZ1234567890';
```

No further configuration is required. The app will query:

- `https://docs.google.com/spreadsheets/d/<SHEET_ID>/gviz/tq?tq=select%20*`

## 3. Donor Photos (Google Drive)

Donor photos are stored separately (for example in Google Drive). For each donor
row in the sheet:

- Set `photo_url` to a **public, direct image URL** (JPG/PNG/WebP).

If `photo_url` is empty or invalid, the site falls back to a neutral placeholder
image.

## 4. GitHub Pages Deployment

The app is designed to be deployed as a static site on GitHub Pages.

### 4.1 Configure the Vite Base Path

In `vite.config.js`, update the `base` option with your repository name:

```js
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/<REPO_NAME>/' : '/',
});
```

If your repository is:

- `https://github.com/username/blood-donation-directory`

then set:

```js
base: process.env.NODE_ENV === 'production'
  ? '/blood-donation-directory/'
  : '/',
```

### 4.2 Build the Site

```bash
npm run build
```

### 4.3 Publish `dist/` to GitHub Pages

You can use any of the common options:

#### Option A: `gh-pages` Branch (manual)

1. Install the GitHub CLI (`gh`) or push manually with git.
2. Build the site: `npm run build`.
3. Commit and push the contents of `dist/` to a `gh-pages` branch.
4. In your GitHub repository settings:
   - Go to **Pages**.
   - Choose **Deploy from a branch**.
   - Select branch `gh-pages`, folder `/` (root).

#### Option B: GitHub Actions (automatic)

You can also use the standard Vite/Node GitHub Actions workflow to:

- Build the site on push to `main`.
- Deploy the `dist/` folder to GitHub Pages.

## 5. Notes and Assumptions

- The app assumes fewer than ~5,000 donor records; all filtering is done
  client-side in the browser.
- Donor information is read-only in the UI. Administrators update data directly
  in Google Sheets.
- There is no backend server, authentication, or secret configuration.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
