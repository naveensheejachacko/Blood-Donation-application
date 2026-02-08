# Blood Donation Directory — User Guide

A short guide for using the Blood Donation Directory website.

---

## For Everyone (Public)

**Website address:**  
Use the main link you received (e.g. `https://blood-donation-application-23lp.vercel.app`).

- You can **browse blood donors** by blood group and district.
- Use the **Blood group** and **District** dropdowns to filter, and **Reset filters** to clear.
- Each card shows: photo, name, blood group, district, weight (if available), last donation date, and whether the donor is **available for donation** (or eligible after a date, based on a 56-day gap since last donation).
- **Click a donor’s photo** to view it enlarged; click outside or the × to close.
- No login is required to view the directory.

---

## For Administrators

### First-time setup

1. Open the **Admin** link (see “Important links” below). You will see **Sign in** and **Register** on the same page.
2. **New user:** Use the **Register** section — enter your **email** and **password**, then submit. Then use **Sign in** and open the **Admin** portal link. You will see a message that your account is **pending approval**. A **super admin** must approve you in **Manage admins** (they click **Unblock** next to your name). After that, you can use the portal.
3. **Existing user:** Use the **Sign in** section — enter your **email** and **password**. If you are already approved, you will see the **Admin portal** and can manage donors.

### In the Admin portal

After login you will see:

- **Add / Edit donor** — Add a new donor or edit an existing one (name, blood group, district, phone, weight, photo, last donation date, **available to donate**). Availability is normally calculated from the last donation date (56 days); you can override it to **Yes** or **No**. You can upload a photo from your device.
- **All donors** — Search and filter the full list. Use **Edit** to change a donor or **Delete** to remove them.
- **Logout** — Use the Logout button at the top to sign out.

**Note:** Only a **super admin** can see and use the **Manage admins** option.

---

## For Super Administrators

- Everything that admins can do, plus:
- **Manage admins** — View all admins and:
  - **Unblock** — Approve someone who just registered (they appear as Blocked until you unblock them).
  - **Make super admin** — Turn any admin into a super admin so they can manage other admins too.
  - **Make regular admin** — Change a super admin back to a normal admin.
  - **Block** / **Unblock** — Block an admin from using the portal, or unblock them.
- You cannot block yourself or remove your own super admin status.

---

## Important links

Replace `YOUR-WEBSITE-URL` with your actual website address (e.g. `https://blood-donation-application-23lp.vercel.app`).

| Purpose           | Link |
|-------------------|------|
| Public directory  | `YOUR-WEBSITE-URL` |
| Admin (sign in & register) | `YOUR-WEBSITE-URL/#/admin/login` |
| Admin portal      | `YOUR-WEBSITE-URL/#/admin` (after login) |

**Example (Vercel):**

- Public: `https://blood-donation-application-23lp.vercel.app`
- Admin (sign in or register): `https://blood-donation-application-23lp.vercel.app/#/admin/login`

Both sign in and register are on the same page. Keep this admin link private and share it only with people who should have admin access.

---

## Need help?

For technical issues or access problems, contact your system administrator or the team that set up the Blood Donation Directory for your organization.
