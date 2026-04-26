# Profile Settings

_Started 2026-04-26 13:39 UTC_

---

## User

now just add in a profile page (to adjust settings) a user has to select the profile on the top right (where the little circle is)

## Assistant

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Let me add the profile page. I'll update `pages.jsx` to add a `ProfileSettings` component and make the avatar clickable, then wire it up in the main app.

_[tool: str_replace_edit]_

Still on it — adding the full profile page component and wiring everything up now.

_[tool: str_replace_edit]_

Now wiring up the `onProfile` prop in all pages and the main app:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now wiring up the `profile` view in the main app:

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: fork_verifier_agent]_

The profile page is live. Click the avatar circle (top-right) from any screen to open it. It includes:

- **Account** — name, email, change password
- **Training Preferences** — goal, units (imperial/metric), default rest timer
- **Notifications** — toggles for weekly summary, PR alerts, coach tips
- **Account Actions** — export CSV, delete account
- **Sticky save bar** at the bottom with a confirmation flash

## User

Verifier agent check completed

## Assistant

All checks passed. ✓

