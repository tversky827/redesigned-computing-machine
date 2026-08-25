/* =============================================================
   Diamonds2Dollars — Central business configuration
   Edit these values in ONE place; they populate the whole site.
   Anything left blank is hidden gracefully. Replace [PLACEHOLDER]
   values with real business information before launch.
   ============================================================= */
window.D2D = {
  name:        "Diamonds2Dollars",
  legalName:   "Diamonds2Dollars, LLC",        // [PLACEHOLDER — confirm legal entity]
  tagline:     "Diamond Buyers",
  domain:      "https://diamonds2dollars.com",

  email:       "offers@diamonds2dollars.com",
  phone:       "",                              // [PLACEHOLDER] e.g. "(312) 555-0142" — leave "" to hide phone UI
  address:     "",                              // [PLACEHOLDER] mailing address, if you want it public
  hours:       "Mon–Fri, 9am–5pm CT",           // [PLACEHOLDER]

  // Offer / process settings
  offerExpirationDays: 7,

  // Integrations
  web3formsKey:      "f2772788-420c-4bd1-9029-6fd501c0cb6f", // form → email delivery
  turnstileSiteKey:  "",   // [PLACEHOLDER] Cloudflare Turnstile site key (free) — leave "" to disable
  cfAnalyticsToken:  "",   // [PLACEHOLDER] Cloudflare Web Analytics token (free) — leave "" to disable

  // Social (leave blank to hide)
  social: { instagram: "", facebook: "", google: "" }
};

/* ---- Injection: fill placeholders, wire links, set year ---- */
(function () {
  var C = window.D2D || {};
  function ready(fn){ document.readyState !== "loading" ? fn() : document.addEventListener("DOMContentLoaded", fn); }
  ready(function () {
    // Text placeholders: <span data-cfg="email"></span>
    document.querySelectorAll("[data-cfg]").forEach(function (el) {
      var key = el.getAttribute("data-cfg");
      var val = C[key];
      if (val) el.textContent = val;
    });
    // Year
    document.querySelectorAll("#yr, [data-cfg=year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
    // mailto links
    document.querySelectorAll('[data-mailto]').forEach(function (a) {
      if (C.email) a.setAttribute("href", "mailto:" + C.email);
    });
    // Phone: show blocks only if a number is configured
    document.querySelectorAll("[data-phone-only]").forEach(function (el) {
      if (C.phone) {
        el.hidden = false;
        el.querySelectorAll("[data-cfg=phone]").forEach(function (s) { s.textContent = C.phone; });
        el.querySelectorAll("[data-tel]").forEach(function (a) {
          a.setAttribute("href", "tel:" + C.phone.replace(/[^\d+]/g, ""));
        });
      } else {
        el.hidden = true;
      }
    });
    // Cloudflare Web Analytics (privacy-friendly), only if a token is set
    if (C.cfAnalyticsToken) {
      var s = document.createElement("script");
      s.defer = true;
      s.src = "https://static.cloudflareinsights.com/beacon.min.js";
      s.setAttribute("data-cf-beacon", JSON.stringify({ token: C.cfAnalyticsToken }));
      document.body.appendChild(s);
    }
  });
})();

/* ---- Lightweight funnel analytics helper (no-op until a
   provider token is configured; safe to call anywhere) ---- */
window.d2dTrack = function (event, data) {
  try {
    (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: event }, data || {}));
  } catch (e) {}
};
