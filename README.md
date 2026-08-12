# Brilliant Offer — Diamond Valuation Landing Page

A single-file landing page (`index.html`) for an online diamond-buying / pawn service.
Visitors fill out a detailed intake form so you can make a buy offer on their diamond jewelry.

## What the form collects

- **Contact:** name, email, phone, city/state (for shipping)
- **The piece:** item type (loose stone, ring, earrings, etc.), metal, number of diamonds
- **The 4 Cs:** carat/size, shape, cut grade, color, clarity, condition
- **Certification:** whether they have one, lab (GIA/IGI/AGS/EGL), report number
- **Photos:** drag-and-drop upload with previews (diamond, setting, hallmarks, certificate)
- **Extras:** asking price, timeline, free-text notes, and a consent checkbox

The form validates required fields and shows a confirmation summary on submit.

## Running it

It's a static page — just open `index.html` in a browser, or host it anywhere
(GitHub Pages, Netlify, Vercel, S3, etc.). No build step, no dependencies.

## Receiving submissions (important)

Out of the box the form captures everything **client-side** and shows the seller a
confirmation. To actually receive submissions in your inbox — including the uploaded
photos — connect the form to a backend or a hosted form service. The quickest option:

1. Create a free endpoint at a form service (e.g. Formspree, Basin, Web3Forms).
2. In `index.html`, find the `<form id="valuationForm" ...>` tag and add
   `action="https://YOUR-ENDPOINT" method="POST"` and `enctype="multipart/form-data"`.
3. In the submit handler (`form.addEventListener('submit', ...)`), replace the
   client-side summary block with `form.submit()` after validation passes, or use
   `fetch()` to POST the `FormData` to your endpoint.

For file attachments to arrive by email, the endpoint must accept
`multipart/form-data`. Wire the `files` array into the `FormData` before sending.

## Customizing

- **Branding:** search for `Brilliant Offer` and the `◆` logo to rename.
- **Colors:** edit the CSS variables in `:root` at the top of `index.html`
  (`--gold`, `--accent`, `--bg`, etc.).
- **Stats/trust strip:** the `$8M+`, `24 hrs`, `4.9★`, `100%` numbers are placeholders.
- **Copy:** hero headline, "How it works" steps, and footer are all inline and easy to edit.
