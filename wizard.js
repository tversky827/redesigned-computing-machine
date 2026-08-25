/* =============================================================
   Diamonds2Dollars — Multi-step submission wizard
   Renders into #wizard. Vanilla JS, no dependencies.
   Submits to Web3Forms (config.js -> D2D.web3formsKey), attaching
   photos and documents, then shows a confirmation with a reference #.
   ============================================================= */
(function () {
  "use strict";
  var mount = document.getElementById("wizard");
  if (!mount) return;

  var CFG = window.D2D || {};
  var MAX_FILE = 15 * 1024 * 1024;         // 15 MB per file
  var ATTACH_LIMIT = 18 * 1024 * 1024;     // total we attempt to email
  var OK_IMG = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
  var OK_DOC = OK_IMG.concat(["application/pdf"]);

  /* ---------------- State ---------------- */
  var state = { values: {}, files: {} };    // files: { key: [File,...] }
  var step = 0;

  var ITEM_TYPES = ["Diamond", "Diamond Ring", "Diamond Earrings", "Diamond Necklace", "Diamond Bracelet", "Other Jewelry"];
  var hasDiamond = function () { return state.values.itemType && state.values.itemType !== "Other Jewelry"; };
  var isLoose    = function () { return state.values.itemType === "Diamond"; };
  var hasSetting = function () { return state.values.itemType && state.values.itemType !== "Diamond"; };
  var isRing     = function () { return state.values.itemType === "Diamond Ring"; };
  var isOther    = function () { return state.values.itemType === "Other Jewelry"; };
  var hasCert    = function () { return state.values.certLab && state.values.certLab !== "No certificate"; };

  /* ---------------- Field schema ---------------- */
  var SHAPES = ["Round", "Princess", "Cushion", "Oval", "Emerald", "Radiant", "Pear", "Marquise", "Asscher", "Heart", "Other / Not sure"];
  var COLORS = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "Fancy color", "Not sure"];
  var CLARITY = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2", "I3", "Not sure"];
  var GRADE = ["Excellent", "Very Good", "Good", "Fair", "Poor", "Not sure"];
  var METALS = ["Platinum", "18K White Gold", "18K Yellow Gold", "14K White Gold", "14K Yellow Gold", "Rose Gold", "Sterling Silver", "Not sure"];

  var STEPS = [
    {
      key: "type", title: "What are you selling?",
      intro: "Choose the option that best matches your item.",
      fields: [{ name: "itemType", type: "cards", required: true, options: ITEM_TYPES }]
    },
    {
      key: "details", title: "Tell us about the item",
      intro: "Estimates are fine — choose “Not sure” if you don’t know. Our gemologists confirm everything on inspection.",
      fields: [
        { name: "diamondType", label: "Natural or lab-grown?", type: "pills", options: ["Natural", "Lab-grown", "Not sure"], show: hasDiamond },
        { name: "carat", label: "Carat weight (total)", type: "text", inputmode: "decimal", placeholder: "e.g. 1.25", show: hasDiamond, required: hasDiamond },
        { name: "shape", label: "Shape", type: "select", options: SHAPES, show: hasDiamond },
        { name: "color", label: "Color", type: "select", options: COLORS, show: hasDiamond },
        { name: "clarity", label: "Clarity", type: "select", options: CLARITY, show: hasDiamond },
        { name: "cut", label: "Cut", type: "select", options: GRADE, show: hasDiamond },
        { name: "polish", label: "Polish", type: "select", options: GRADE, show: hasDiamond },
        { name: "symmetry", label: "Symmetry", type: "select", options: GRADE, show: hasDiamond },
        { name: "fluorescence", label: "Fluorescence", type: "select", options: ["None", "Faint", "Medium", "Strong", "Not sure"], show: hasDiamond },
        { name: "numberOfStones", label: "Number of diamonds", type: "select", options: ["1", "2", "3–5", "6+", "Not sure"], show: function () { return hasDiamond() && !isLoose(); } },
        { name: "metal", label: "Metal", type: "select", options: METALS, show: hasSetting },
        { name: "brand", label: "Designer / brand", hint: "if any", type: "text", placeholder: "e.g. Tiffany & Co.", show: hasSetting },
        { name: "ringSize", label: "Ring size", hint: "if known", type: "text", inputmode: "decimal", placeholder: "e.g. 6.5", show: isRing },
        { name: "otherDescription", label: "Describe the item", type: "textarea", placeholder: "Tell us what it is and any details that help us value it.", show: isOther, required: isOther },
        { name: "condition", label: "Condition", type: "select", options: ["Like new", "Lightly worn", "Visible wear", "Damaged", "Not sure"], show: hasSetting },
        { name: "age", label: "Approximate age", type: "select", options: ["New / recent", "A few years", "10+ years", "Vintage / antique", "Not sure"], show: hasSetting }
      ]
    },
    {
      key: "cert", title: "Certificate & grading",
      intro: "A lab report helps us make a more precise offer, but it isn’t required.",
      fields: [
        { name: "certLab", label: "Do you have a grading report?", type: "select", options: ["No certificate", "GIA", "IGI", "AGS", "HRD", "Other"], value: "No certificate" },
        { name: "certNumber", label: "Report number", hint: "if you have it", type: "text", placeholder: "e.g. GIA 2141438171", show: hasCert },
        { name: "certFile", label: "Upload the report", hint: "PDF or photo — optional", type: "files", accept: OK_DOC, max: 3 }
      ]
    },
    {
      key: "photos", title: "Add photos",
      intro: "Clear photos get faster, more accurate offers. Place the item on a plain surface in good, natural light and fill the frame.",
      fields: [
        { name: "photo_front", label: "Front / top view", type: "photo" },
        { name: "photo_side", label: "Side / profile", type: "photo" },
        { name: "photo_closeup", label: "Close-up of the diamond", type: "photo" },
        { name: "photo_back", label: "Back / underside", type: "photo" },
        { name: "photo_hallmark", label: "Hallmark / stamp", type: "photo" },
        { name: "photo_extra", label: "Anything else", type: "photo", multiple: true }
      ]
    },
    {
      key: "docs", title: "Purchase & documents",
      intro: "All optional — these help us value your item but don’t guarantee an offer.",
      fields: [
        { name: "purchasePrice", label: "Original purchase price", hint: "optional", type: "text", inputmode: "numeric", placeholder: "$" },
        { name: "purchaseDate", label: "Approximate purchase date", hint: "optional", type: "text", placeholder: "e.g. 2019" },
        { name: "retailer", label: "Where it was purchased", hint: "optional", type: "text", placeholder: "e.g. Local jeweler, Zales…" },
        { name: "docFiles", label: "Receipt, appraisal, or insurance valuation", hint: "PDF or photo — optional", type: "files", accept: OK_DOC, max: 5 }
      ]
    },
    {
      key: "contact", title: "Your details",
      intro: "We’ll use these only to send your offer and updates. Your information stays private.",
      fields: [
        { name: "firstName", label: "First name", type: "text", required: true, autocomplete: "given-name" },
        { name: "lastName", label: "Last name", type: "text", required: true, autocomplete: "family-name" },
        { name: "email", label: "Email", type: "email", required: true, autocomplete: "email", inputmode: "email" },
        { name: "phone", label: "Phone", type: "tel", autocomplete: "tel", inputmode: "tel", placeholder: "(555) 123-4567" },
        { name: "zip", label: "ZIP code", hint: "for shipping", type: "text", inputmode: "numeric", autocomplete: "postal-code" },
        { name: "preferredContact", label: "Preferred contact method", type: "pills", options: ["Email", "Phone", "Text"], value: "Email" },
        { name: "consent", type: "consent", required: true,
          text: "I confirm the information above is accurate and I’d like a free, no-obligation offer. Estimates are confirmed after inspection." }
      ]
    }
  ];

  /* ---------------- Helpers ---------------- */
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) { if (k === "class") e.className = attrs[k]; else e.setAttribute(k, attrs[k]); }
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[<>&]/g, function (c) { return { "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]; }); }
  function visibleFields(s) { return s.fields.filter(function (f) { return !f.show || f.show(); }); }
  function fmtBytes(n) { return n > 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB"; }

  /* ---------------- Render ---------------- */
  function render() {
    mount.innerHTML = "";
    var isReview = step === STEPS.length;
    var total = STEPS.length + 1;
    var current = step + 1;

    // Progress
    var prog = el("div", { class: "wz-progress" });
    prog.appendChild(el("div", { class: "wz-progress-label" },
      "Step " + Math.min(current, total) + " of " + total + (isReview ? " · Review" : "")));
    var bar = el("div", { class: "wz-bar" });
    var fill = el("div", { class: "wz-bar-fill" });
    fill.style.width = Math.round((current / total) * 100) + "%";
    bar.appendChild(fill); prog.appendChild(bar);
    mount.appendChild(prog);

    var card = el("div", { class: "wz-card" });

    if (isReview) { renderReview(card); }
    else {
      var s = STEPS[step];
      card.appendChild(el("h3", { class: "wz-title" }, esc(s.title)));
      if (s.intro) card.appendChild(el("p", { class: "wz-intro" }, esc(s.intro)));
      var body = el("div", { class: "wz-fields" });
      visibleFields(s).forEach(function (f) { body.appendChild(renderField(f)); });
      card.appendChild(body);
    }

    // Nav
    var nav = el("div", { class: "wz-nav" });
    if (step > 0) {
      var back = el("button", { type: "button", class: "btn btn-ghost wz-back" }, "← Back");
      back.onclick = function () { step--; scrollTop(); render(); };
      nav.appendChild(back);
    } else { nav.appendChild(el("span")); }

    var nextLabel = isReview ? "Submit My Diamond" : (step === STEPS.length - 1 ? "Review my submission →" : "Continue →");
    var next = el("button", { type: "button", class: "btn btn-gold wz-next" }, nextLabel);
    next.onclick = isReview ? submit : goNext;
    nav.appendChild(next);
    card.appendChild(nav);

    mount.appendChild(card);
  }

  function renderField(f) {
    var wrap = el("div", { class: "wz-field" + (f.type === "cards" || f.type === "consent" || f.type === "photo" || f.type === "files" || f.type === "textarea" ? " full" : "") });
    if (f.label) {
      var lab = el("label", { for: "f_" + f.name }, esc(f.label) + (f.required && (typeof f.required !== "function" || f.required()) ? ' <span class="req">◆</span>' : (f.hint ? ' <span class="hint">— ' + esc(f.hint) + "</span>" : "")));
      wrap.appendChild(lab);
    }
    var val = state.values[f.name] != null ? state.values[f.name] : (f.value || "");

    if (f.type === "cards") {
      var grid = el("div", { class: "wz-cards" });
      f.options.forEach(function (opt) {
        var c = el("button", { type: "button", class: "wz-cardopt" + (val === opt ? " on" : "") }, "<span class='ic'>◆</span><span>" + esc(opt) + "</span>");
        c.onclick = function () { state.values[f.name] = opt; render(); };
        grid.appendChild(c);
      });
      wrap.appendChild(grid);
    } else if (f.type === "pills") {
      var row = el("div", { class: "wz-pills" });
      f.options.forEach(function (opt) {
        var p = el("button", { type: "button", class: "wz-pill" + (val === opt ? " on" : "") }, esc(opt));
        p.onclick = function () { state.values[f.name] = opt; row.querySelectorAll(".wz-pill").forEach(function (x) { x.classList.remove("on"); }); p.classList.add("on"); };
        row.appendChild(p);
      });
      wrap.appendChild(row);
    } else if (f.type === "select") {
      var sel = el("select", { id: "f_" + f.name });
      sel.appendChild(el("option", { value: "" }, "Select…"));
      f.options.forEach(function (opt) {
        var o = el("option", { value: opt }, esc(opt)); if (val === opt) o.selected = true; sel.appendChild(o);
      });
      sel.onchange = function () { state.values[f.name] = sel.value; };
      wrap.appendChild(sel);
    } else if (f.type === "textarea") {
      var ta = el("textarea", { id: "f_" + f.name, placeholder: f.placeholder || "" }); ta.value = val;
      ta.oninput = function () { state.values[f.name] = ta.value; clearErr(wrap); };
      wrap.appendChild(ta);
    } else if (f.type === "consent") {
      var box = el("label", { class: "wz-consent" });
      var cb = el("input", { type: "checkbox", id: "f_" + f.name }); if (val === true) cb.checked = true;
      cb.onchange = function () { state.values[f.name] = cb.checked; clearErr(wrap); };
      box.appendChild(cb); box.appendChild(el("span", null, esc(f.text)));
      wrap.appendChild(box);
    } else if (f.type === "photo" || f.type === "files") {
      wrap.appendChild(renderUploader(f));
    } else {
      var inp = el("input", { type: f.type === "email" ? "email" : f.type === "tel" ? "tel" : "text", id: "f_" + f.name, placeholder: f.placeholder || "" });
      if (f.inputmode) inp.setAttribute("inputmode", f.inputmode);
      if (f.autocomplete) inp.setAttribute("autocomplete", f.autocomplete);
      inp.value = val;
      inp.oninput = function () { state.values[f.name] = inp.value; clearErr(wrap); };
      wrap.appendChild(inp);
    }
    wrap.appendChild(el("div", { class: "wz-err" }));
    return wrap;
  }

  function renderUploader(f) {
    var box = el("div", { class: "wz-upload" });
    var accept = f.accept || OK_IMG;
    var isPhoto = f.type === "photo";
    var drop = el("label", { class: "wz-drop" + (isPhoto ? " photo" : "") });
    drop.innerHTML = "<span class='ico'>" + (isPhoto ? "📷" : "📄") + "</span><b>Tap to add" + (f.multiple ? " photos" : (isPhoto ? " a photo" : " files")) + "</b><small>" +
      (isPhoto ? "or drag &amp; drop" : "PDF or image") + "</small>";
    var input = el("input", { type: "file", accept: accept.join(","), hidden: "hidden" });
    if (f.multiple || !isPhoto) input.setAttribute("multiple", "multiple");
    if (isPhoto) input.setAttribute("capture", "environment");
    drop.appendChild(input);
    box.appendChild(drop);

    var previews = el("div", { class: "wz-previews" });
    box.appendChild(previews);
    var errline = el("div", { class: "wz-err" });
    box.appendChild(errline);

    function addFiles(list) {
      state.files[f.name] = state.files[f.name] || [];
      var cur = state.files[f.name];
      errline.textContent = "";
      Array.prototype.forEach.call(list, function (file) {
        var okType = accept.indexOf(file.type) !== -1 || (!isPhoto && /\.pdf$/i.test(file.name)) || file.type.indexOf("image/") === 0;
        if (!okType) { errline.textContent = '“' + file.name + '” isn’t a supported file type.'; return; }
        if (file.size > MAX_FILE) { errline.textContent = '“' + file.name + '” is over ' + fmtBytes(MAX_FILE) + ' and was skipped.'; return; }
        var limit = f.max || (isPhoto && !f.multiple ? 1 : 12);
        if (cur.length >= limit) { errline.textContent = "You can add up to " + limit + " here."; return; }
        cur.push(file);
      });
      drawPreviews();
    }
    function drawPreviews() {
      previews.innerHTML = "";
      (state.files[f.name] || []).forEach(function (file, i) {
        var t = el("div", { class: "wz-thumb" });
        if (file.type.indexOf("image/") === 0) {
          var url = URL.createObjectURL(file);
          t.appendChild(el("img", { src: url, alt: "" }));
        } else {
          t.appendChild(el("div", { class: "wz-doc" }, "PDF"));
        }
        var rm = el("button", { type: "button", title: "Remove" }, "×");
        rm.onclick = function () { state.files[f.name].splice(i, 1); drawPreviews(); };
        t.appendChild(rm);
        previews.appendChild(t);
      });
    }
    input.onchange = function () { addFiles(input.files); input.value = ""; };
    ["dragover", "dragenter"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("drag"); }); });
    ["dragleave", "drop"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("drag"); }); });
    drop.addEventListener("drop", function (e) { addFiles(e.dataTransfer.files); });
    drawPreviews();
    return box;
  }

  /* ---------------- Validation ---------------- */
  function goNext() {
    if (!validateStep()) return;
    d2dTrack("wizard_step_complete", { step: STEPS[step].key });
    step++; scrollTop(); render();
  }
  function validateStep() {
    var s = STEPS[step], ok = true, firstBad = null;
    visibleFields(s).forEach(function (f) {
      var req = typeof f.required === "function" ? f.required() : f.required;
      if (!req) return;
      var node = document.getElementById("f_" + f.name);
      var bad = false, v = state.values[f.name];
      if (f.type === "consent") bad = v !== true;
      else if (f.type === "cards") bad = !v;
      else bad = !v || !String(v).trim();
      if (!bad && f.type === "email") bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (bad) {
        ok = false;
        var wrap = node ? node.closest(".wz-field") : (f.type === "cards" ? mount.querySelector(".wz-field") : null);
        if (wrap) { wrap.classList.add("invalid"); var e = wrap.querySelector(".wz-err"); if (e) e.textContent = f.type === "consent" ? "Please confirm to continue." : "This field is required."; }
        if (!firstBad) firstBad = wrap;
      }
    });
    if (firstBad) firstBad.scrollIntoView({ behavior: "smooth", block: "center" });
    return ok;
  }
  function clearErr(wrap) { wrap.classList.remove("invalid"); var e = wrap.querySelector(".wz-err"); if (e) e.textContent = ""; }

  /* ---------------- Review ---------------- */
  function labelFor(name) {
    for (var i = 0; i < STEPS.length; i++) for (var j = 0; j < STEPS[i].fields.length; j++)
      if (STEPS[i].fields[j].name === name) return STEPS[i].fields[j].label || name;
    return name;
  }
  function reviewRows() {
    var rows = [];
    var order = ["itemType", "diamondType", "carat", "shape", "color", "clarity", "cut", "polish", "symmetry", "fluorescence", "numberOfStones", "metal", "brand", "ringSize", "otherDescription", "condition", "age", "certLab", "certNumber", "purchasePrice", "purchaseDate", "retailer", "firstName", "lastName", "email", "phone", "zip", "preferredContact"];
    order.forEach(function (k) {
      var v = state.values[k];
      if (v && String(v).trim() && v !== "No certificate") {
        var lbl = k === "itemType" ? "Item" : k === "firstName" ? "Name" : labelFor(k);
        if (k === "lastName") return; // merged into name
        if (k === "firstName") v = (state.values.firstName || "") + " " + (state.values.lastName || "");
        rows.push([lbl, v]);
      }
    });
    var nPhotos = 0; ["photo_front", "photo_side", "photo_closeup", "photo_back", "photo_hallmark", "photo_extra"].forEach(function (k) { nPhotos += (state.files[k] || []).length; });
    var nDocs = (state.files.certFile || []).length + (state.files.docFiles || []).length;
    rows.push(["Photos", String(nPhotos)]);
    if (nDocs) rows.push(["Documents", String(nDocs)]);
    return rows;
  }
  function renderReview(card) {
    card.appendChild(el("h3", { class: "wz-title" }, "Review your submission"));
    card.appendChild(el("p", { class: "wz-intro" }, "Please confirm everything looks right, then submit. You can go back to make changes."));
    var list = el("div", { class: "wz-review" });
    reviewRows().forEach(function (r) {
      var row = el("div"); row.appendChild(el("span", null, esc(r[0]))); row.appendChild(el("span", null, esc(r[1]))); list.appendChild(row);
    });
    card.appendChild(list);
  }

  /* ---------------- Submit ---------------- */
  function allFiles() {
    var out = [];
    for (var k in state.files) (state.files[k] || []).forEach(function (f, i) { out.push({ field: k + "_" + (i + 1), file: f }); });
    return out;
  }
  function buildFD(includeFiles, ref) {
    var fd = new FormData();
    fd.append("access_key", CFG.web3formsKey || "");
    fd.append("subject", "New diamond submission " + ref + " — " + (state.values.firstName || "") + " " + (state.values.lastName || ""));
    fd.append("from_name", "Diamonds2Dollars website");
    if (state.values.email) fd.append("replyto", state.values.email);
    fd.append("botcheck", "");
    var ts = document.querySelector('[name="cf-turnstile-response"]');
    if (ts && ts.value) fd.append("cf-turnstile-response", ts.value);
    fd.append("Submission #", ref);
    reviewRows().forEach(function (r) { fd.append(r[0], r[1]); });
    if (includeFiles) allFiles().forEach(function (o) { fd.append(o.field, o.file, o.file.name); });
    else if (allFiles().length) fd.append("Attachments note", allFiles().length + " file(s) were too large to email — reply to the customer to request them.");
    return fd;
  }
  function newRef() {
    var t = Date.now().toString(36).slice(-4).toUpperCase();
    var r = Math.random().toString(36).slice(2, 6).toUpperCase();
    return "D2D-" + t + r;
  }
  async function post(fd) {
    try {
      var res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: fd });
      var j = await res.json().catch(function () { return {}; });
      return res.ok && j.success;
    } catch (e) { return false; }
  }
  async function submit() {
    var btn = mount.querySelector(".wz-next");
    var label = btn.textContent; btn.disabled = true; btn.textContent = "Submitting…";
    var ref = newRef();
    var total = allFiles().reduce(function (s, o) { return s + o.file.size; }, 0);
    var withFiles = total <= ATTACH_LIMIT;
    var ok = await post(buildFD(withFiles, ref));
    if (!ok && withFiles) ok = await post(buildFD(false, ref));
    btn.disabled = false; btn.textContent = label;
    if (!ok) {
      var err = mount.querySelector(".wz-card").querySelector(".wz-nav");
      var m = mount.querySelector(".wz-submit-err") || el("div", { class: "wz-submit-err" });
      m.textContent = "Sorry — we couldn’t submit that. Please check your connection and try again, or email us at " + (CFG.email || "our team") + ".";
      err.parentNode.insertBefore(m, err);
      return;
    }
    d2dTrack("form_submitted", { ref: ref });
    showConfirmation(ref);
  }

  function showConfirmation(ref) {
    mount.innerHTML = "";
    var c = el("div", { class: "wz-done" });
    c.appendChild(el("div", { class: "wz-check" }, "✓"));
    c.appendChild(el("h3", null, "We’ve received your submission"));
    c.appendChild(el("p", null, "Your request has been sent to our buying team. We’ll review your item and email your offer — typically within one business day."));
    c.appendChild(el("div", { class: "wz-ref" }, "Submission number<br><b>" + esc(ref) + "</b>"));
    c.appendChild(el("p", { class: "wz-note" }, "Keep this number for your records. We’ve sent everything to our team at " + esc(CFG.email || "our office") + "."));
    var again = el("button", { type: "button", class: "btn btn-ghost" }, "Submit another item");
    again.onclick = function () { state = { values: {}, files: {} }; step = 0; scrollTop(); render(); };
    c.appendChild(again);
    mount.appendChild(c);
    scrollTop();
  }

  function scrollTop() { var t = document.getElementById("valuation"); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" }); }

  render();
})();
