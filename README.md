# Diamonds2Dollars

Online diamond & jewelry buying website. Customers submit an item, receive an
offer from the buying team, and (if they accept) ship insured and get paid.

Static site hosted on **Cloudflare Pages** (auto-deploys from `main`). No build step.

## Files
| File | Purpose |
|---|---|
| `index.html` | Homepage: hero, trust sections, **multi-step submission wizard**, contact |
| `wizard.js` | The data-driven multi-step form (dynamic fields, photo/doc upload, submit → email) |
| `config.js` | **Central business configuration** — edit business info in one place |
| `styles.css` | Shared stylesheet for every page |
| `faq.html` / `privacy.html` / `terms.html` | Support & legal pages |
| `sell-*.html`, `how-much-is-my-diamond-worth.html` | SEO landing pages |
| `favicon.svg` / `og.png` | Brand favicon and social/link-preview image |
| `sitemap.xml` / `robots.txt` | Technical SEO |

## Business configuration
Edit `config.js`. Values marked `[PLACEHOLDER]` need real business info:
- `phone` — leave `""` to hide all phone UI; set it to reveal call links everywhere
- `turnstileSiteKey` — free Cloudflare Turnstile key to enable bot protection
- `cfAnalyticsToken` — free Cloudflare Web Analytics token to enable analytics
- `legalName`, `address`, `hours`, `offerExpirationDays`, social links

## How submissions work today
The wizard emails each submission (with photos/documents attached, size permitting)
to `offers@diamonds2dollars.com` via **Web3Forms**, and shows the customer a
confirmation with a reference number. There is **no database, admin dashboard,
offer-accept system, or customer login** — those require a backend (see below).

## Phase 2 — backend (not yet built)
A real admin pipeline, stored offers with accept/decline, customer portal,
transactional emails, private document storage, and admin analytics require a
server-side layer. Recommended Cloudflare-native stack: **Pages Functions + D1
(database) + R2 (private file storage) + Cloudflare Access (admin auth) + a
transactional email provider (e.g. Resend)**. This needs provisioning in the
Cloudflare account and API keys.
