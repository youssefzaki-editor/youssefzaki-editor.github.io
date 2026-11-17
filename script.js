/* =====================================================================
   Site behaviour. Content lives in content.js — edit that file instead.
   ===================================================================== */
(function () {
  "use strict";

  document.documentElement.classList.add("js");
  const SITE = window.SITE || {};
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Fill text from content.js ---------- */
  $$("[data-bind]").forEach((el) => {
    const value = SITE[el.dataset.bind];
    if (value) el.textContent = value;
  });
  $("#availability").hidden = !SITE.available;
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Portrait (photo or initials) ---------- */
  const frame = $(".portrait__frame");
  const showInitials = () => {
    const initials = (SITE.name || "")
      .split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
    frame.innerHTML = `<span class="portrait__initials" aria-hidden="true">${initials}</span>`;
    frame.setAttribute("role", "img");
    frame.setAttribute("aria-label", SITE.name || "Profile");
  };
  if (SITE.photo) {
    const img = new Image();
    img.src = SITE.photo;
    img.alt = `Portrait of ${SITE.name || "the editor"}`;
    img.width = 800; img.height = 800;
    img.decoding = "async";
    img.fetchPriority = "high";
    img.onerror = showInitials;
    frame.appendChild(img);
  } else {
    showInitials();
  }

  /* ---------- About photo ---------- */
  const aboutFig = $("#aboutPhoto");
  if (aboutFig && SITE.aboutPhoto) {
    const img = new Image();
    img.src = SITE.aboutPhoto;
    img.alt = `${SITE.name || "The editor"}, ${SITE.role || "video editor"}`;
    img.width = 800; img.height = 1000;
    img.loading = "lazy";
    img.decoding = "async";
    img.onerror = () => (aboutFig.hidden = true);
    aboutFig.appendChild(img);
    aboutFig.hidden = false;
  }

  /* ---------- Contact links ---------- */
  const digits = String(SITE.phoneLink || "").replace(/[^\d+]/g, "");
  const setLink = (id, href) => {
    const el = $(id);
    if (!el) return;
    if (href) el.href = href;
    else el.closest("li").remove(); // hide a channel if its detail is missing
  };
  const mailHref = SITE.email ? `mailto:${SITE.email}` : "";
  const waHref = digits
    ? `https://wa.me/${digits.replace("+", "")}?text=${encodeURIComponent(SITE.whatsappMessage || "")}`
    : "";
  setLink("#contactEmail", mailHref);
  setLink("#contactPhone", digits ? `tel:${digits}` : "");
  setLink("#contactWhatsapp", waHref);
  // footer links (removed if the detail is missing)
  [["#footerEmail", mailHref], ["#footerWhatsapp", waHref]].forEach(([id, href]) => {
    const el = $(id);
    if (!el) return;
    if (href) el.href = href; else el.remove();
  });

  /* ---------- Skills & tools ---------- */
  const ICONS = {
    audio: '<path d="M4 10v4M8 6v12M12 9v6M16 4v16M20 10v4"/>',
    color: '<circle cx="9" cy="9" r="5"/><circle cx="15" cy="9" r="5"/><circle cx="12" cy="15" r="5"/>',
    motion: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z"/>',
    captions: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M7 12h4M13 12h4M7 15.5h7"/>',
    ads: '<path d="M3 10v4a1 1 0 0 0 1 1h3l6 4V5L7 9H4a1 1 0 0 0-1 1z"/><path d="M17 8.5a5 5 0 0 1 0 7M19.5 6a8.5 8.5 0 0 1 0 12"/>',
    story: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M3 8l2.5-4.5L9 4 6.5 8.5M10 4l3.5.3L11 8.5M14.5 4.3 18 4.6 15.5 8.5"/>',
    brand: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>',
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  $("#skillsList").innerHTML = (SITE.skills || []).map((s) => `
    <li class="skill reveal">
      <span class="skill__icon" aria-hidden="true"><svg viewBox="0 0 24 24">${ICONS[s.icon] || ICONS.motion}</svg></span>
      <span class="skill__text">
        <span class="skill__name">${esc(s.name)}</span>
        ${s.text ? `<span class="skill__desc">${esc(s.text)}</span>` : ""}
      </span>
    </li>`).join("");

  $("#toolsList").innerHTML = (SITE.tools || []).map((t) => `
    <li class="tool">
      <span class="tool__badge" aria-hidden="true">${esc(t.short || t.name.slice(0, 2))}</span>
      <span class="tool__name">${esc(t.name)}</span>
    </li>`).join("");

  /* ---------- Video helpers ---------- */
  const PLATFORM = { drive: "Google Drive", instagram: "Instagram", youtube: "YouTube", mp4: "Video" };

  function driveId(url) {
    const m = url.match(/\/file\/d\/([\w-]+)/) || url.match(/[?&]id=([\w-]+)/);
    return m ? m[1] : null;
  }
  function instagramPath(url) {
    const m = url.match(/instagram\.com\/(p|reel|tv)\/([\w-]+)/);
    return m ? `${m[1]}/${m[2]}` : null;
  }
  function youtubeId(url) {
    const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
    return m ? m[1] : null;
  }

  /** Returns { embed, open } — embed is the URL for the player, open is for "open in new tab". */
  function resolveVideo(v) {
    const url = v.videoUrl || "";
    switch (v.videoType) {
      case "drive": {
        const id = driveId(url);
        // "open" keeps the exact link from content.js
        return id
          ? { embed: `https://drive.google.com/file/d/${id}/preview`, open: url }
          : { embed: null, open: url };
      }
      case "instagram": {
        const p = instagramPath(url);
        return p
          ? { embed: `https://www.instagram.com/${p}/embed/`, open: url }
          : { embed: null, open: url };
      }
      case "youtube": {
        const id = youtubeId(url);
        return id
          ? { embed: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`, open: `https://www.youtube.com/watch?v=${id}` }
          : { embed: null, open: url };
      }
      case "mp4":
        return { embed: url, open: url, native: true };
      default:
        return { embed: null, open: url };
    }
  }

  /* ---------- Portfolio grid ---------- */
  const videos = SITE.videos || [];
  const grid = $("#grid");

  grid.innerHTML = videos.map((v, i) => {
    const horizontal = v.orientation === "horizontal";
    return `
    <li class="card reveal${horizontal ? " card--horizontal" : ""}" data-category="${esc(v.category || "")}">
      <button class="card__btn" type="button" data-index="${i}" aria-label="Play video: ${esc(v.title)}">
        <span class="card__media${v.thumbnail ? "" : " no-thumb"}">
          <span class="card__fallback">${esc(v.title)}</span>
          ${v.thumbnail ? `<img src="${esc(v.thumbnail)}" alt="" loading="lazy" decoding="async" width="720" height="${horizontal ? 405 : 1280}">` : ""}
          <span class="card__top">
            <span class="tag tag--muted">${esc(PLATFORM[v.videoType] || "Video")}</span>
            ${v.duration ? `<span class="tag">${esc(v.duration)}</span>` : ""}
          </span>
          <span class="card__play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></span>
          <span class="card__info">
            ${v.category ? `<span class="card__cat">${esc(v.category)}</span>` : ""}
            <span class="card__title">${esc(v.title)}</span>
          </span>
        </span>
      </button>
    </li>`;
  }).join("");

  // Missing/broken thumbnail → remove it so the styled fallback shows.
  $$("img", grid).forEach((img) =>
    img.addEventListener("error", () => {
      img.closest(".card__media").classList.add("no-thumb");
      img.remove();
    }, { once: true })
  );

  /* ---------- Filters (built from the categories used) ---------- */
  const categories = [...new Set(videos.map((v) => v.category).filter(Boolean))];
  const filters = $("#filters");
  if (categories.length > 1) {
    const count = (c) => videos.filter((v) => c === "All" || v.category === c).length;
    filters.innerHTML = ["All", ...categories].map((c, i) => `
      <button class="filter" type="button" data-filter="${esc(c)}" aria-pressed="${i === 0}">
        ${esc(c)}<span class="filter__count">${count(c)}</span>
      </button>`).join("");

    filters.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter");
      if (!btn) return;
      const f = btn.dataset.filter;
      $$(".filter", filters).forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      $$(".card", grid).forEach((card) => {
        const show = f === "All" || card.dataset.category === f;
        card.classList.toggle("is-hidden", !show);
        if (show) card.classList.add("is-visible");
      });
    });
  }

  /* ---------- Video modal ---------- */
  const modal = $("#modal");
  const player = $("#modalPlayer");
  const loader = $(".modal__loader", player);
  let lastFocus = null;
  let closeTimer = null;

  function openModal(index) {
    const v = videos[index];
    if (!v) return;
    const src = resolveVideo(v);

    // No embeddable URL → just open the original link.
    if (!src.embed) {
      window.open(src.open, "_blank", "noopener");
      return;
    }

    clearTimeout(closeTimer);
    lastFocus = document.activeElement;
    $("#modalTitle").textContent = v.title;
    $("#modalCat").textContent = v.category || "";
    const openLink = $("#modalOpen");
    openLink.href = src.open;
    openLink.textContent = `Open on ${PLATFORM[v.videoType] || "the original site"} ↗`;

    player.className = "modal__player " +
      (v.videoType === "instagram" ? "is-instagram" : v.orientation === "horizontal" ? "is-horizontal" : "is-vertical");
    $$("iframe, video", player).forEach((n) => n.remove());
    loader.hidden = false;

    let media;
    if (src.native) {
      media = document.createElement("video");
      media.src = src.embed;
      media.controls = true;
      media.autoplay = true;
      media.playsInline = true;
      media.addEventListener("loadeddata", () => (loader.hidden = true), { once: true });
    } else {
      media = document.createElement("iframe");
      media.src = src.embed;
      media.title = v.title;
      media.allow = "autoplay; encrypted-media; fullscreen; picture-in-picture";
      media.allowFullscreen = true;
      media.referrerPolicy = "strict-origin-when-cross-origin";
      media.addEventListener("load", () => (loader.hidden = true), { once: true });
    }
    player.appendChild(media);

    modal.hidden = false;
    document.body.classList.add("is-locked");
    requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add("is-open")));
    $(".modal__close", modal).focus();
  }

  function closeModal() {
    if (modal.hidden) return;
    modal.classList.remove("is-open");
    // Removing the iframe/video stops playback immediately.
    $$("iframe, video", player).forEach((n) => {
      if (n.tagName === "VIDEO") { n.pause(); n.removeAttribute("src"); n.load(); }
      else n.src = "about:blank";
      n.remove();
    });
    document.body.classList.remove("is-locked");
    closeTimer = setTimeout(() => (modal.hidden = true), reduceMotion ? 0 : 320);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".card__btn");
    if (btn) openModal(Number(btn.dataset.index));
  });
  modal.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (modal.hidden) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "Tab") {
      // keep focus inside the dialog
      const focusable = $$('button, a[href], iframe, video', modal).filter((el) => el.offsetParent !== null);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Header: scrolled state, mobile menu, active link ---------- */
  const header = $("#header");
  const nav = $("#nav");
  const toggle = $("#navToggle");

  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("is-open", open);
    header.classList.toggle("menu-open", open);
  }
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); toggle.focus(); }
  });
  window.matchMedia("(min-width: 821px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });

  const links = $$(".nav__link");
  const sections = links.map((l) => $(l.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => {
          const active = l.getAttribute("href") === `#${entry.target.id}`;
          l.classList.toggle("is-active", active);
          if (active) l.setAttribute("aria-current", "true"); else l.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = $$(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        // small stagger for items in the same row
        const siblings = el.parentElement ? $$(":scope > .reveal", el.parentElement) : [];
        el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 6) * 60}ms`;
        el.classList.add("is-visible");
        setTimeout(() => (el.style.transitionDelay = ""), 1200); // so hover effects aren't delayed
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach((el) => io.observe(el));
  }
})();
