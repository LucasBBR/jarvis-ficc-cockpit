(function () {
  const data = window.JV_DATA;
  const root = document.getElementById("root");

  if (!data || !root) {
    return;
  }

  const state = {
    searchOpen: false,
    searchQuery: "",
    coverageOpen: false,
    plOpen: false,
    docsOpen: false,
    creditOpen: false,
    hrOpen: false,
    docsTab: "cgd",
    docsCounterparty: "all",
    creditFilter: "",
    creditPage: 0,
    insightsOpen: false,
    jarvisFullscreen: false,
    jarvisSignalsCollapsed: false,
    clientSelected: true,
    loadingPanels: new Set(["relationship", "coverage", "pl", "notes", "hr", "docs", "book", "insights"]),
    refreshingPanels: new Set(),
    errors: {},
    stale: {},
    justUpdated: new Set(),
    connection: "live",
    lastSync: "09:42",
    toasts: [],
    toastSeq: 0,
    toastTimers: {},
    pendingConfirm: null,
    devOpen: false,
    reduceMotion: localStorage.getItem("jvReduceMotion") === "1" || window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches,
    userMenuOpen: false,
    customizeMode: false,
    savingStatus: "",
    searchMode: "idle",
    voiceWords: [],
    actedInsights: new Set(),
    arrivedInsights: new Set(),
    insightFeedback: {},
    insightDislikeTarget: null,
    insightDislikeDraft: "",
    insightFeedbackError: "",
    deletedNoteUndo: null,
    cardOpen: { notes: true, docs: true, hr: true, book: true },
    panelOrder: ["notes", "book"],
    notesTab: "all",
    composerScope: "personal",
    composerHtml: "",
    listening: false,
    hasDictated: false,
    draftStep: 0,
    dictationTimers: [],
    expandedNotes: new Set(),
    focusNoteKey: null,
    focusEdit: false,
    focusHtml: "",
    docDrill: null,
    bookView: "trades",
    bookProduct: data.book.products[0],
    memberFilter: "all",
    chat: [...data.nba.recentChat],
    askDraft: "",
    thinking: false,
    askTimer: null,
  };
  let logoSequence = 0;

  const iconPaths = {
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 10v6M12 7h.01"/>',
    warning: '<path d="M12 3l10 18H2L12 3z"/><path d="M12 9v5M12 17h.01"/>',
    error: '<circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    retry: '<path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v6h-6"/>',
    undo: '<path d="M9 7H4v5"/><path d="M4 12a8 8 0 1 0 2.3-5.7L4 8"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><rect x="4" y="4" width="11" height="11" rx="2"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"/>',
    ticket: '<path d="M4 7a2 2 0 0 1 2-2h12v4a2 2 0 0 0 0 4v4H6a2 2 0 0 1-2-2v-4a2 2 0 0 0 0-4z"/><path d="M9 9h5M9 13h6"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    pin: '<path d="M14 4l6 6-4 1-4 7-2-2 7-4 1-4-6-6z"/><path d="M9 15l-5 5"/>',
    thumbUp: '<path d="M7 10v11H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3z"/><path d="M7 10l4-7a2 2 0 0 1 3.7 1.2L14 8h5a2 2 0 0 1 2 2.3l-1.2 8A3 3 0 0 1 16.8 21H7"/>',
    thumbDown: '<path d="M7 14V3H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3z"/><path d="M7 14l4 7a2 2 0 0 0 3.7-1.2L14 16h5a2 2 0 0 0 2-2.3l-1.2-8A3 3 0 0 0 16.8 3H7"/>',
    bell: '<path d="M6 8a6 6 0 1 1 12 0v5l2 3H4l2-3z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a7.5 7.5 0 0 0 0-3l1.7-1.3-1.7-3-2 .8a7.5 7.5 0 0 0-2.6-1.5L14.5 3h-3l-.3 1.5a7.5 7.5 0 0 0-2.6 1.5l-2-.8-1.7 3 1.7 1.3a7.5 7.5 0 0 0 0 3l-1.7 1.3 1.7 3 2-.8a7.5 7.5 0 0 0 2.6 1.5L11.5 21h3l.3-1.5a7.5 7.5 0 0 0 2.6-1.5l2 .8 1.7-3-1.7-1.3z"/>',
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    drag: '<circle cx="9" cy="6" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="9" cy="18" r="1.2"/><circle cx="15" cy="6" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="15" cy="18" r="1.2"/>',
    more: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
    expand: '<path d="M4 4h6M4 4v6M20 20h-6M20 20v-6M4 4l7 7M20 20l-7-7"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    chevD: '<path d="M6 9l6 6 6-6"/>',
    chevR: '<path d="M9 6l6 6-6 6"/>',
    chevU: '<path d="M18 15l-6-6-6 6"/>',
    arrowUp: '<path d="M12 19V5"/><path d="M5 12l7-7 7 7"/>',
    arrowDn: '<path d="M12 5v14"/><path d="M19 12l-7 7-7-7"/>',
    arrowR: '<path d="M5 12h14M13 5l7 7-7 7"/>',
    fileText: '<path d="M14 3H6v18h12V7l-4-4z"/><path d="M14 3v4h4M9 13h6M9 17h6"/>',
    download: '<path d="M12 4v12M6 12l6 6 6-6M4 20h16"/>',
    mic: '<rect x="9" y="3" width="6" height="13" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    sparkle: '<path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/><path d="M19 16l.7 1.8L21.5 18.5l-1.8.7L19 21l-.7-1.8L16.5 18.5l1.8-.7z"/>',
    check: '<path d="M5 12l5 5L20 7"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
    pencil: '<path d="M4 20h4l11-11-4-4L4 16z"/><path d="M14 5l4 4"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5M3 18l9 5 9-5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>',
    send: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  };

  function icon(name, size = 16) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || ""}</svg>`;
  }

  function jarvisLogo(logoState = "idle", size = 40, showLabel = false) {
    const uid = `jv-logo-${++logoSequence}`;
    const label = logoState === "thinking" ? "thinking" : "idle";
    return `
      <span class="jarvis-logo jarvis-logo--${label} ${showLabel ? "jarvis-logo--labeled" : ""}" style="--jarvis-size:${size}px" data-state="${label}">
        <svg class="jarvis-logo__mark" viewBox="0 0 120 120" role="img" aria-labelledby="${uid}-title" focusable="false">
          <title id="${uid}-title">Jarvis AI assistant, ${label}</title>
          <defs>
            <radialGradient id="${uid}-core" cx="42%" cy="36%" r="72%">
              <stop offset="0%" stop-color="var(--jarvis-navy)" stop-opacity="0.7"></stop>
              <stop offset="46%" stop-color="var(--jarvis-core)"></stop>
              <stop offset="100%" stop-color="#00030a"></stop>
            </radialGradient>
            <radialGradient id="${uid}-halo" cx="50%" cy="50%" r="58%">
              <stop offset="58%" stop-color="var(--jarvis-blue-2)" stop-opacity="0"></stop>
              <stop offset="76%" stop-color="var(--jarvis-blue-3)" stop-opacity="0.3"></stop>
              <stop offset="91%" stop-color="var(--jarvis-blue-light)" stop-opacity="0.16"></stop>
              <stop offset="100%" stop-color="var(--jarvis-blue-light)" stop-opacity="0"></stop>
            </radialGradient>
            <linearGradient id="${uid}-ring" x1="20" y1="20" x2="100" y2="100">
              <stop offset="0%" stop-color="var(--jarvis-blue-light)"></stop>
              <stop offset="31%" stop-color="var(--jarvis-blue-3)"></stop>
              <stop offset="62%" stop-color="var(--jarvis-blue-2)"></stop>
              <stop offset="100%" stop-color="var(--jarvis-blue-light)"></stop>
            </linearGradient>
            <filter id="${uid}-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="3.5" result="blur"></feGaussianBlur>
              <feMerge><feMergeNode in="blur"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge>
            </filter>
          </defs>
          <circle class="jarvis-logo__aura" cx="60" cy="60" r="52" fill="url(#${uid}-halo)"></circle>
          <circle class="jarvis-logo__core-shadow" cx="60" cy="60" r="39" fill="var(--jarvis-bg)"></circle>
          <circle class="jarvis-logo__core" cx="60" cy="60" r="36.5" fill="url(#${uid}-core)"></circle>
          <circle class="jarvis-logo__inner-rim" cx="60" cy="60" r="35" fill="none" stroke="var(--jarvis-blue-light)" stroke-opacity="0.08" stroke-width="1"></circle>
          <g class="jarvis-logo__ring">
            <circle class="jarvis-logo__ring-base" cx="60" cy="60" r="43" fill="none" stroke="var(--jarvis-blue)" stroke-opacity="0.28" stroke-width="2"></circle>
            <circle class="jarvis-logo__ring-arc jarvis-logo__ring-arc--primary" cx="60" cy="60" r="43" fill="none" stroke="url(#${uid}-ring)" stroke-dasharray="92 178" stroke-linecap="round" stroke-width="3.4" filter="url(#${uid}-glow)"></circle>
            <circle class="jarvis-logo__ring-arc jarvis-logo__ring-arc--secondary" cx="60" cy="60" r="43" fill="none" stroke="var(--jarvis-blue-light)" stroke-dasharray="24 246" stroke-dashoffset="122" stroke-linecap="round" stroke-opacity="0.72" stroke-width="2.2"></circle>
          </g>
          <g class="jarvis-logo__orbit">
            <circle class="jarvis-logo__orbit-track" cx="60" cy="60" r="49" fill="none" stroke="var(--jarvis-blue-light)" stroke-dasharray="2 12" stroke-linecap="round" stroke-opacity="0.18" stroke-width="1"></circle>
            <circle class="jarvis-logo__orbit-point" cx="60" cy="11" r="2.35" fill="var(--jarvis-blue-light)" filter="url(#${uid}-glow)"></circle>
          </g>
          <g class="jarvis-logo__eyes">
            <rect class="jarvis-logo__eye jarvis-logo__eye--left" x="48.4" y="49.2" width="10.8" height="21.6" rx="5.4" transform="rotate(-1 53.8 60)"></rect>
            <rect class="jarvis-logo__eye jarvis-logo__eye--right" x="62.8" y="49.2" width="10.8" height="21.6" rx="5.4" transform="rotate(1 68.2 60)"></rect>
          </g>
        </svg>
        ${showLabel ? '<span class="jarvis-logo__label" aria-hidden="true">Jarvis</span>' : ""}
      </span>
    `;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatNumber(value) {
    return Number(value).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function currentTimestamp() {
    return new Date().toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function currentTime() {
    return new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function isLoading(panel) {
    return state.loadingPanels.has(panel);
  }

  function isRefreshing(panel) {
    return state.refreshingPanels.has(panel);
  }

  function panelError(panel) {
    return state.errors[panel];
  }

  function panelStale(panel) {
    return state.stale[panel] || (state.connection !== "live" ? statusLabel().tag : "");
  }

  function isUpdated(key) {
    return state.justUpdated.has(key);
  }

  function statusLabel() {
    if (state.connection === "offline") return { kind: "error", label: "Offline", tag: "Cached data", detail: "Offline — showing cached data" };
    if (state.connection === "reconnecting") return { kind: "warning", label: "Reconnecting…", tag: "Reconnecting", detail: "Reconnecting to feeds" };
    return { kind: "success", label: "Live", tag: "", detail: "Live feeds connected" };
  }

  function clearPanel(panel) {
    state.loadingPanels.delete(panel);
    state.refreshingPanels.delete(panel);
    delete state.errors[panel];
  }

  function flash(key, delay = 650) {
    state.justUpdated.add(key);
    renderApp();
    window.setTimeout(() => {
      state.justUpdated.delete(key);
      renderApp();
    }, state.reduceMotion ? 80 : delay);
  }

  function skeleton(width = "100%", height = 12, className = "") {
    return `<span class="jv-skeleton ${className}" style="width:${width};height:${height}px"></span>`;
  }

  function renderPanelError(panel, title = "Couldn't load this panel.", reason = "This usually clears in a moment.") {
    const message = panelError(panel) || reason;
    return `
      <div class="jv-state-block error" role="alert">
        <span class="state-icon">${icon("error", 18)}</span>
        <div>
          <div class="t">${escapeHtml(title)}</div>
          <div class="s">${escapeHtml(message)}</div>
        </div>
        <button class="jv-btn sm" data-action="retry-panel" data-panel="${escapeHtml(panel)}">${icon("retry", 12)} Retry</button>
      </div>
    `;
  }

  function renderEmptyState(kind, title, message, action = "") {
    return `
      <div class="jv-state-block ${escapeHtml(kind)}">
        <span class="state-icon">${icon(kind === "error" ? "error" : kind === "warning" ? "warning" : "info", 18)}</span>
        <div>
          <div class="t">${escapeHtml(title)}</div>
          <div class="s">${escapeHtml(message)}</div>
        </div>
        ${action}
      </div>
    `;
  }

  function renderStateBadges(panel) {
    const stale = panelStale(panel);
    const error = panelError(panel);
    return `
      ${isRefreshing(panel) ? `<span class="jv-panel-chip info">${icon("retry", 11)} Refreshing</span>` : ""}
      ${stale ? `<span class="jv-panel-chip stale">${icon("clock", 11)} ${escapeHtml(stale)}</span>` : ""}
      ${error ? `<span class="jv-panel-chip danger">${icon("error", 11)} Error</span>` : ""}
    `;
  }

  function renderTableSkeleton(rows = 6, columns = [24, 16, 18, 18, 14, 12]) {
    return `
      <div class="jv-book-tablewrap">
        <table class="jv-table jv-skeleton-table" aria-hidden="true">
          <thead><tr>${columns.map((width) => `<th>${skeleton(`${width}%`, 8)}</th>`).join("")}</tr></thead>
          <tbody>
            ${Array.from({ length: rows }).map(() => `
              <tr>${columns.map((width) => `<td>${skeleton(`${Math.max(32, width + 18)}%`, 10)}</td>`).join("")}</tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderBookSkeleton() {
    const rows = state.bookView === "positions" ? 6 : 10;
    const cols = state.bookView === "positions" ? [24, 12, 16, 16, 16, 10, 12] : [14, 22, 12, 16, 14, 14, 12];
    return `
      <div class="jv-book-tabs">
        ${data.book.products.map((product, index) => `<span class="jv-book-tab ${index === 0 ? "active" : ""}">${escapeHtml(product)}<span class="ct">–</span></span>`).join("")}
      </div>
      <div class="jv-book-toolbar">${skeleton("90px", 10)}${skeleton("160px", 28)}<span style="margin-left:auto">${skeleton("52px", 10)}</span></div>
      ${renderTableSkeleton(rows, cols)}
    `;
  }

  function renderNotesSkeleton() {
    return `
      <div class="jv-skel-editor">
        <div>${skeleton("42%", 12)}${skeleton("18%", 12)}</div>
        ${skeleton("100%", 70)}
        <div>${skeleton("12%", 20)}${skeleton("12%", 20)}${skeleton("24%", 24)}</div>
      </div>
      <div class="jv-notes-stream">
        ${Array.from({ length: 2 }).map(() => `
          <article class="jv-note">
            ${skeleton("34%", 14)}
            ${skeleton("96%", 12)}
            ${skeleton("86%", 12)}
            ${skeleton("56%", 12)}
          </article>
        `).join("")}
      </div>
    `;
  }

  function renderHitRatioSkeleton() {
    return `
      <div class="jv-hr-pair">
        ${Array.from({ length: 2 }).map(() => `
          <div class="jv-hr-cell">
            ${skeleton("32%", 10)}
            ${skeleton("54px", 38, "circleish")}
            ${skeleton("70%", 10)}
            ${skeleton("100%", 4)}
          </div>
        `).join("")}
      </div>
      <div class="jv-hr-platforms">
        <div class="head">${skeleton("45%", 8)}</div>
        ${Array.from({ length: 4 }).map(() => `<div class="jv-hr-platform">${skeleton("72px", 10)}${skeleton("100%", 5)}${skeleton("26px", 10)}<span></span>${skeleton("42px", 10)}${skeleton("44px", 10)}</div>`).join("")}
      </div>
    `;
  }

  function renderDocumentsSkeleton() {
    return `
      <div class="jv-doc-summary">
        ${Array.from({ length: 3 }).map(() => `
          <div class="jv-doc-summary-card">
            ${skeleton("28%", 9)}
            ${skeleton("44%", 22)}
            ${skeleton("82%", 10)}
            ${skeleton("100%", 4)}
          </div>
        `).join("")}
      </div>
    `;
  }

  function renderCoverageSkeleton() {
    return `
      <ul class="jv-cov-list" aria-hidden="true">
        ${Array.from({ length: 4 }).map(() => `
          <li>
            ${skeleton("28px", 28, "round")}
            <div class="meta">${skeleton("48%", 11)}${skeleton("76%", 10)}</div>
          </li>
        `).join("")}
      </ul>
    `;
  }

  function renderPLSkeleton() {
    return `
      <div class="jv-pl-skel">
        <div class="head">${skeleton("34%", 10)}${skeleton("112px", 28)}</div>
        ${skeleton("100%", 54)}
        <div class="rows">
          ${Array.from({ length: 3 }).map(() => `<div>${skeleton("26%", 10)}${skeleton("20%", 10)}${skeleton("16%", 10)}${skeleton("22%", 6)}</div>`).join("")}
        </div>
      </div>
    `;
  }

  function renderInsightsSkeleton() {
    return `
      <div class="jv-signal-stage">
        <div class="jv-signal-scroller">
          <div class="jv-signal-grid single-row">
            <div class="jv-signal-card next skeleton-card">${skeleton("62%", 22)}${skeleton("84%", 12)}${skeleton("70%", 10)}</div>
            ${Array.from({ length: 4 }).map(() => `<div class="jv-signal-card skeleton-card">${skeleton("42%", 18)}${skeleton("82%", 11)}${skeleton("64%", 10)}</div>`).join("")}
          </div>
        </div>
      </div>
    `;
  }

  function toastIcon(variant) {
    return icon({
      success: "check",
      info: "info",
      warning: "warning",
      error: "error",
      ai: "sparkle",
    }[variant] || "info", 16);
  }

  function pushToast(variant, headline, context = "", actionLabel = "", action = "") {
    const id = `toast-${++state.toastSeq}`;
    state.toasts.unshift({ id, variant, headline, context, actionLabel, action });
    state.toasts = state.toasts.slice(0, 8);
    renderApp();
    const duration = variant === "error" ? 0 : variant === "warning" ? 7000 : 4000;
    if (duration) {
      state.toastTimers[id] = window.setTimeout(() => dismissToast(id), duration);
    }
    return id;
  }

  function dismissToast(id) {
    if (state.toastTimers[id]) {
      clearTimeout(state.toastTimers[id]);
      delete state.toastTimers[id];
    }
    state.toasts = state.toasts.filter((toast) => toast.id !== id);
    renderApp();
  }

  function renderToasts() {
    const visible = state.toasts.slice(0, 3);
    return `
      <div class="jv-toast-region" aria-live="polite" aria-atomic="false">
        ${visible.map((toast) => `
          <div class="jv-toast ${escapeHtml(toast.variant)}" role="${toast.variant === "error" ? "alert" : "status"}" data-toast-id="${escapeHtml(toast.id)}">
            <span class="ico">${toastIcon(toast.variant)}</span>
            <div class="copy">
              <div class="head">${escapeHtml(toast.headline)}</div>
              ${toast.context ? `<div class="ctx">${escapeHtml(toast.context)}</div>` : ""}
              ${toast.actionLabel ? `<button class="jv-toast-action" data-action="toast-action" data-toast-id="${escapeHtml(toast.id)}">${escapeHtml(toast.actionLabel)}</button>` : ""}
            </div>
            <button class="x" data-action="dismiss-toast" data-toast-id="${escapeHtml(toast.id)}" title="Dismiss">${icon("close", 13)}</button>
          </div>
        `).join("")}
      </div>
    `;
  }

  function renderSystemStatus() {
    const status = statusLabel();
    return `
      <div class="jv-system-status ${escapeHtml(status.kind)}" title="${escapeHtml(status.detail)} · last sync ${escapeHtml(state.lastSync)}">
        <span class="dot"></span>
        <span>${escapeHtml(status.label)}</span>
        <span class="sync">Last sync ${escapeHtml(state.lastSync)}</span>
      </div>
    `;
  }

  function closeTopPopovers() {
    state.coverageOpen = false;
    state.plOpen = false;
    state.docsOpen = false;
    state.creditOpen = false;
    state.hrOpen = false;
  }

  function allDocuments() {
    return ["cgd", "fx"].flatMap((kind) => (data.documents[kind]?.items || []).map((item) => ({ ...item, kind })));
  }

  function documentStatusMeta(kind, counterpartyId = "all") {
    const rows = documentRows(kind, counterpartyId);
    if (!rows.length) return { kind: "danger", label: "Missing", status: "missing" };
    if (rows.some((row) => row.status === "pending")) return { kind: "warning", label: "Pending", status: "pending" };
    if (rows.some((row) => row.status === "warning")) return { kind: "warning", label: "Review", status: "warning" };
    return { kind: "success", label: "Active", status: "active" };
  }

  function documentsKpi() {
    const cgd = documentStatusMeta("cgd");
    const fx = documentStatusMeta("fx");
    const kind = cgd.kind === "danger" || fx.kind === "danger" ? "danger" : cgd.kind === "warning" || fx.kind === "warning" ? "warning" : "success";
    return {
      kind,
      cgd,
      fx,
      label: `CGD ${cgd.label} · FX ${fx.label}`,
      detail: "Document status by product family and counterparty",
    };
  }

  function creditKpi() {
    const credit = data.documents.credit;
    const approved = Number(credit.approved) > 0;
    return {
      kind: approved ? "success" : "danger",
      label: approved ? `R$ ${credit.used}m / ${credit.approved}m` : "No limit",
      detail: approved ? `${credit.utilization}% consumed` : "Credit limit not approved",
    };
  }

  function creditCounterparties() {
    const names = [
      "Vale S.A.",
      "Vale Manganês",
      "Vale Canadá Mining",
      "Salobo Metais",
      "Vale Fertilizantes",
      "Vale International",
      "Vale Oman Pelletizing",
      "PT Vale Indonesia",
      "Minerações Brasileiras",
      "Vale Shipping",
      "Vale Energia",
      "Vale Base Metals",
    ];
    return names.map((name, index) => {
      const approved = [360, 120, 150, 90, 100, 80, 55, 50, 35, 25, 20, 15][index];
      const used = [332, 78, 121, 44, 86, 58, 19, 17, 9, 7, 5, 3][index];
      return {
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        name,
        approved,
        used,
        available: approved - used,
      };
    });
  }

  function filteredCreditCounterparties() {
    const query = state.creditFilter.trim().toLowerCase();
    return creditCounterparties().filter((counterparty) => !query || counterparty.name.toLowerCase().includes(query));
  }

  function documentCounterparties() {
    return data.client.members.map((member) => ({ id: member.id, name: member.name }));
  }

  function documentRows(kind, counterpartyId = "all") {
    const source = data.documents[kind]?.items || [];
    const counterparties = counterpartyId === "all"
      ? documentCounterparties()
      : documentCounterparties().filter((counterparty) => counterparty.id === counterpartyId);
    return counterparties.flatMap((counterparty, counterpartyIndex) => source.map((item, itemIndex) => {
      let status = item.status;
      if (counterpartyIndex > 0 && item.status === "pending") status = counterpartyIndex % 2 ? "active" : "warning";
      if (counterpartyIndex > 1 && item.status === "warning") status = counterpartyIndex % 3 ? "active" : "pending";
      return { ...item, status, counterparty: counterparty.name, counterpartyId: counterparty.id, key: `${kind}-${counterparty.id}-${itemIndex}` };
    }));
  }

  function cleanText(html) {
    const holder = document.createElement("div");
    holder.innerHTML = html || "";
    return holder.textContent.trim();
  }

  function decorateHashtags(html) {
    const holder = document.createElement("div");
    holder.innerHTML = html || "";
    const nodes = [];
    const walker = document.createTreeWalker(holder, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!/(^|\s)#[A-Za-z0-9_-]{2,}/.test(node.nodeValue || "")) return NodeFilter.FILTER_REJECT;
        if (node.parentElement?.closest(".jv-htag")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const fragment = document.createDocumentFragment();
      const parts = (node.nodeValue || "").split(/((?:^|\s)#[A-Za-z0-9_-]{2,})/g);
      parts.forEach((part) => {
        const match = part.match(/^(\s?)(#[A-Za-z0-9_-]{2,})$/);
        if (!match) {
          fragment.appendChild(document.createTextNode(part));
          return;
        }
        if (match[1]) fragment.appendChild(document.createTextNode(match[1]));
        const tag = document.createElement("span");
        tag.className = "jv-htag";
        tag.textContent = match[2];
        fragment.appendChild(tag);
      });
      node.parentNode.replaceChild(fragment, node);
    });
    return holder.innerHTML;
  }

  function noteKey(scope, note) {
    return `${scope}:${note.id}`;
  }

  function findNote(key) {
    const [scope, id] = key.split(":");
    const collection = data.notes[scope] || [];
    const note = collection.find((candidate) => candidate.id === id);
    return note ? { scope, note } : null;
  }

  function renderApp() {
    logoSequence = 0;
    root.innerHTML = `
      <div class="jv-app ${state.reduceMotion ? "reduce-motion" : ""} ${state.customizeMode ? "customize-mode" : ""} connection-${state.connection}">
        ${renderTopBar()}
        <main class="jv-main">
          <div class="jv-stack">
            ${state.panelOrder.map(renderMainPanel).join("")}
          </div>
        </main>
        ${renderInsightsPanel()}
        ${renderDevControls()}
        ${renderToasts()}
        ${state.focusNoteKey ? renderFocusModal() : ""}
      </div>
    `;
    bindRenderedEvents();
    syncDynamicControls();
  }

  function renderMainPanel(panelId) {
    if (panelId === "notes") return renderNotesCard();
    if (panelId === "book") return renderBookCard();
    return "";
  }

  function renderTopBar() {
    return `
      <div class="jv-topbar">
        <div class="jv-brand">
          <div class="jv-jarvis-logo" title="Jarvis">
            ${jarvisLogo("idle", 28)}
          </div>
          <div>
            <div class="jv-brand-name">${state.clientSelected ? escapeHtml(data.client.group) : "No client selected"}</div>
          </div>
        </div>
        <div class="jv-search-wrap">
          <div class="jv-search">
            ${icon("search")}
            <input data-input="search" type="text" placeholder="Search economic group..." value="${escapeHtml(state.searchQuery)}" />
            <span class="jv-kbd">⌘K</span>
          </div>
          ${state.searchOpen ? renderSearchDropdown() : ""}
        </div>
        <div class="jv-top-actions">
          ${renderSystemStatus()}
          <button class="jv-icon-mini inverse" data-action="toggle-customize" title="Customize panels">${icon("grid", 15)}</button>
          <button class="jv-icon-mini inverse" data-action="toggle-user-menu" title="User preferences">${icon("settings", 15)}</button>
          ${state.userMenuOpen ? renderUserMenu() : ""}
        </div>
      </div>
      <div class="jv-kpi-bar">
        <div class="jv-kpi-left">
          <span class="jv-client-name">${state.clientSelected ? escapeHtml(data.client.group) : "No client selected"}</span>
          ${renderHistoricalRelationship()}
        </div>
        <div class="jv-kpi-strip">
          ${renderCoverageChip()}
          ${renderPLChip()}
          ${renderDocumentsChip()}
          ${renderCreditChip()}
          ${renderHitRatioChip()}
        </div>
      </div>
    `;
  }

  function renderUserMenu() {
    return `
      <div class="jv-user-menu">
        <label class="jv-pref-row">
          <span>
            <strong>Reduce motion</strong>
            <small>Use direct state changes, no transitions.</small>
          </span>
          <input type="checkbox" data-input="reduce-motion" ${state.reduceMotion ? "checked" : ""} />
        </label>
      </div>
    `;
  }

  function renderHistoricalRelationship() {
    if (!state.clientSelected) {
      return `<span class="jv-relationship muted">${icon("info", 12)} Search a client to load their full picture.</span>`;
    }
    if (isLoading("relationship")) {
      return `<span class="jv-relationship">${skeleton("132px", 12)}</span>`;
    }
    const years = new Date().getFullYear() - data.client.relationshipSince;
    return `
      <span class="jv-relationship ${isUpdated("relationship") ? "jv-updated" : ""}">
        ${icon("clock", 12)} Relationship since ${data.client.relationshipSince} · ${years}y
        ${renderStateBadges("relationship")}
      </span>
    `;
  }

  function renderSearchDropdown() {
    const query = state.searchQuery.toLowerCase();
    if (state.searchMode === "loading") {
      return `
        <div class="jv-search-dropdown">
          <div class="jv-search-section">Loading results</div>
          ${Array.from({ length: 3 }).map(() => `<div class="jv-search-row muted"><div>${skeleton("46%", 12)}${skeleton("72%", 10)}</div></div>`).join("")}
        </div>
      `;
    }
    if (state.searchMode === "error") {
      return `
        <div class="jv-search-dropdown">
          <div class="jv-search-section">Search unavailable</div>
          <div class="jv-search-state">
            ${icon("error", 17)}
            <div>
              <div class="name">Search unavailable. Retry.</div>
              <div class="meta">The client index did not respond.</div>
            </div>
            <button class="jv-btn sm" data-action="search-retry">${icon("retry", 12)} Retry</button>
          </div>
        </div>
      `;
    }
    const results = query
      ? data.searchResults.filter((result) => result.name.toLowerCase().includes(query))
      : data.searchResults;
    if (query && !results.length) {
      return `
        <div class="jv-search-dropdown">
          <div class="jv-search-section">No results</div>
          <div class="jv-search-state">
            ${icon("search", 17)}
            <div>
              <div class="name">No clients match "${escapeHtml(state.searchQuery)}".</div>
              <div class="meta">Check spelling or try CNPJ.</div>
            </div>
          </div>
        </div>
      `;
    }
    const companies = results.map((result, index) => `
      <div class="jv-search-row ${index === 0 ? "kbd" : ""} ${result.id === "vale" ? "active" : ""}" data-action="select-client" data-id="${escapeHtml(result.id)}">
        <div>
          <div class="name">${escapeHtml(result.name)}</div>
          <div class="meta">${escapeHtml(result.sector)} · Coverage ${escapeHtml(result.coverage)}</div>
        </div>
        ${result.id === "vale" ? '<span class="now-tag">current</span>' : ""}
        ${icon("arrowR", 14)}
      </div>
    `).join("");
    const recents = data.searchResults.slice(0, 2).map((result) => `
      <div class="jv-search-row compact" data-action="select-client" data-id="${escapeHtml(result.id)}">
        <div><div class="name">${escapeHtml(result.name)}</div><div class="meta">Recent relationship</div></div>
        ${icon("clock", 13)}
      </div>
    `).join("");
    const sectors = [...new Set(data.searchResults.map((result) => result.sector))].map((sector) => `
      <div class="jv-search-row compact">
        <div><div class="name">${escapeHtml(sector)}</div><div class="meta">Sector coverage list</div></div>
        ${icon("filter", 13)}
      </div>
    `).join("");
    return `
      <div class="jv-search-dropdown">
        <div class="jv-search-section">Companies</div>
        ${companies}
        ${query ? "" : `<div class="jv-search-section">Recent</div>${recents}<div class="jv-search-section">Sectors</div>${sectors}`}
      </div>
    `;
  }

  function renderCoverageChip() {
    const team = data.client.coverageTeam;
    const primary = team.find((member) => member.primary) || team[0];
    if (!state.clientSelected) {
      return `
        <div class="jv-cov-wrap">
          <button class="jv-cov-chip muted" data-action="focus-search">
            ${icon("user", 13)}
            <span class="lab">Coverage</span>
            <span class="primary">No client</span>
          </button>
        </div>
      `;
    }
    return `
      <div class="jv-cov-wrap">
        <button class="jv-cov-chip ${state.coverageOpen ? "open" : ""}" data-action="toggle-coverage">
          ${icon("user", 13)}
          <span class="lab">Coverage</span>
          <span class="primary">${isLoading("coverage") ? skeleton("62px", 12) : escapeHtml(primary.name.split(" ").pop())}</span>
          ${isLoading("coverage") ? "" : `<span class="cnt">+${team.length - 1}</span>`}
          ${icon("chevD", 11)}
        </button>
        ${state.coverageOpen ? `
          <div class="jv-cov-pop">
            ${isRefreshing("coverage") ? '<div class="jv-refresh-bar"><i></i></div>' : ""}
            <div class="jv-cov-pop-head">
              <div class="t">Coverage team</div>
              <div class="s">${team.length} officers across BTG · Vale economic group ${renderStateBadges("coverage")}</div>
            </div>
            ${panelError("coverage") ? renderPanelError("coverage", "Couldn't reach officer coverage.", "Coverage directory unavailable.") : isLoading("coverage") ? renderCoverageSkeleton() : `
              <ul class="jv-cov-list">
                ${team.map((member) => `
                  <li>
                    <span class="name">${escapeHtml(member.name)}</span>
                    <span class="area">${escapeHtml(member.area)}</span>
                  </li>
                `).join("")}
              </ul>
            `}
          </div>
        ` : ""}
      </div>
    `;
  }

  function renderPLChip() {
    const directionClass = data.pl.deltaPct >= 0 ? "pos" : "neg";
    if (!state.clientSelected) {
      return `
        <div class="jv-pl-chip-wrap">
          <button class="jv-pl-chip muted" data-action="focus-search">
            <span class="k">P&amp;L</span>
            <span class="v">No client</span>
          </button>
        </div>
      `;
    }
    return `
      <div class="jv-pl-chip-wrap">
        <button class="jv-pl-chip ${state.plOpen ? "open" : ""}" data-action="toggle-pl">
          <span class="k">P&amp;L · ${escapeHtml(data.pl.period)}</span>
          <span class="v ${isUpdated("pl") ? "jv-number-tick" : ""}" data-action="copy-pl">${isLoading("pl") ? skeleton("78px", 12) : `R$ ${formatNumber(data.pl.value)}<span class="u">m</span>`}</span>
          ${isLoading("pl") ? "" : `<span class="d ${directionClass}">
            ${icon(data.pl.deltaPct >= 0 ? "arrowUp" : "arrowDn", 10)}
            ${data.pl.deltaPct > 0 ? "+" : ""}${data.pl.deltaPct}%
          </span>`}
          ${icon("chevD", 12)}
        </button>
        ${state.plOpen ? renderPLPopover() : ""}
      </div>
    `;
  }

  function renderPLPopover() {
    const maxValue = Math.max(...data.pl.breakdown.map((breakdown) => breakdown.value));
    return `
      <div class="jv-pl-pop">
        ${isRefreshing("pl") ? '<div class="jv-refresh-bar"><i></i></div>' : ""}
        <div class="jv-pl-pop-head">
          <div>
            <div class="t">P&amp;L breakdown</div>
            <div class="s">${escapeHtml(data.pl.period)} vs same window prior year ${renderStateBadges("pl")}</div>
          </div>
          <div class="hero">
            <button class="big copy-number ${isUpdated("pl") ? "jv-number-tick" : ""}" data-action="copy-pl">R$ ${formatNumber(data.pl.value)}<small>m</small></button>
            <div class="prior">vs R$ ${formatNumber(data.pl.prior)}m prior</div>
          </div>
        </div>
        ${panelError("pl") ? renderPanelError("pl", "Couldn't reach P&L feed.", "Settlement feed unavailable.") : isLoading("pl") ? renderPLSkeleton() : `
          <table class="jv-pl-pop-table">
            <thead>
              <tr><th>Product</th><th class="num">Current</th><th class="num">Prior</th><th class="num">Δ %</th><th></th></tr>
            </thead>
            <tbody>
              ${data.pl.breakdown.map((breakdown) => {
                const positive = breakdown.deltaPct >= 0;
                return `
                  <tr>
                    <td>${escapeHtml(breakdown.name)}</td>
                    <td class="num" data-action="copy-value" data-value="${formatNumber(breakdown.value)}">${formatNumber(breakdown.value)}</td>
                    <td class="num prior">${formatNumber(breakdown.prior)}</td>
                    <td class="num ${positive ? "pos" : "neg"}">${positive ? "+" : ""}${breakdown.deltaPct.toFixed(1)}%</td>
                    <td class="bar"><i style="width: ${(breakdown.value / maxValue) * 100}%"></i></td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        `}
        <div class="jv-pl-pop-foot">Source · BTG FICC settlement feed · refreshed 09:42 BRT</div>
      </div>
    `;
  }

  function renderDocumentsChip() {
    const kpi = documentsKpi();
    return `
      <div class="jv-kpi-wrap">
        <button class="jv-kpi-chip ${kpi.kind} ${state.docsOpen ? "open" : ""}" data-action="toggle-docs">
          ${icon("fileText", 13)}
          <span class="lab">Documents</span>
          <span class="jv-doc-kpi-set">
            <span class="${kpi.cgd.kind}">CGD ${escapeHtml(kpi.cgd.label)}</span>
            <span class="${kpi.fx.kind}">FX ${escapeHtml(kpi.fx.label)}</span>
          </span>
          ${icon("chevD", 11)}
        </button>
        ${state.docsOpen ? renderDocumentsPopover(kpi) : ""}
      </div>
    `;
  }

  function renderDocumentsPopover(kpi) {
    const selected = state.docsCounterparty;
    const selectedName = selected === "all" ? "All counterparties" : documentCounterparties().find((counterparty) => counterparty.id === selected)?.name || "Counterparty";
    const activeKind = state.docsTab === "fx" ? "fx" : "cgd";
    const activeTitle = activeKind === "cgd" ? "CGD · Derivatives" : "FX · Câmbio";
    return `
      <div class="jv-kpi-pop docs">
        <div class="jv-kpi-pop-head">
          <div>
            <div class="t">Documents</div>
            <div class="s">${escapeHtml(selectedName)} · ${escapeHtml(kpi.detail)}</div>
          </div>
          <span class="jv-kpi-state ${escapeHtml(kpi.kind)}">${escapeHtml(kpi.cgd.label)} / ${escapeHtml(kpi.fx.label)}</span>
        </div>
        <div class="jv-doc-tabs">
          <button class="${activeKind === "cgd" ? "active" : ""}" data-action="docs-tab" data-value="cgd">CGD <span class="${kpi.cgd.kind}">${escapeHtml(kpi.cgd.label)}</span></button>
          <button class="${activeKind === "fx" ? "active" : ""}" data-action="docs-tab" data-value="fx">FX <span class="${kpi.fx.kind}">${escapeHtml(kpi.fx.label)}</span></button>
        </div>
        <div class="jv-pop-filter">
          <label>Counterparty</label>
          <select class="jv-select" data-input="docs-counterparty">
            <option value="all" ${selected === "all" ? "selected" : ""}>All counterparties</option>
            ${documentCounterparties().map((counterparty) => `<option value="${escapeHtml(counterparty.id)}" ${selected === counterparty.id ? "selected" : ""}>${escapeHtml(counterparty.name)}</option>`).join("")}
          </select>
        </div>
        ${renderDocumentSection(activeKind, activeTitle, selected)}
      </div>
    `;
  }

  function renderDocumentSection(kind, title, counterpartyId) {
    const rows = documentRows(kind, counterpartyId);
    const meta = documentStatusMeta(kind, counterpartyId);
    return `
      <section class="jv-doc-section">
        <header>
          <div>
            <div class="t">${escapeHtml(title)}</div>
            <div class="s">${rows.length} documents · ${counterpartyId === "all" ? "all counterparties" : "selected counterparty"}</div>
          </div>
          <span class="jv-kpi-state ${escapeHtml(meta.kind)}">${escapeHtml(meta.label)}</span>
        </header>
        ${rows.length ? `
          <div class="jv-doc-table-wrap">
            <table class="jv-doc-table">
              <thead><tr><th>Counterparty</th><th>Document</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                ${rows.map((document) => `
                  <tr>
                    <td>${escapeHtml(document.counterparty)}</td>
                    <td><strong>${escapeHtml(document.name)}</strong><span>${escapeHtml(document.sub || "Framework")}</span></td>
                    <td class="jv-mono">${escapeHtml(document.date)}</td>
                    <td>${docStatusBadge(document.status)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        ` : renderEmptyState("error", `No ${title} documents`, "No active document set for this counterparty.")}
      </section>
    `;
  }

  function renderCreditChip() {
    const credit = data.documents.credit;
    const kpi = creditKpi();
    return `
      <div class="jv-kpi-wrap">
        <button class="jv-kpi-chip ${kpi.kind} ${state.creditOpen ? "open" : ""}" data-action="toggle-credit">
          ${icon("layers", 13)}
          <span class="lab">Credit</span>
          <span class="v">${escapeHtml(kpi.label)}</span>
          <span class="mini-gauge"><i style="width:${Math.min(100, credit.utilization)}%"></i></span>
          ${icon("chevD", 11)}
        </button>
        ${state.creditOpen ? renderCreditPopover(kpi) : ""}
      </div>
    `;
  }

  function renderCreditPopover(kpi) {
    const credit = data.documents.credit;
    const rows = filteredCreditCounterparties();
    const pageSize = 5;
    const maxPage = Math.max(0, Math.ceil(rows.length / pageSize) - 1);
    if (state.creditPage > maxPage) state.creditPage = maxPage;
    const pageRows = rows.slice(state.creditPage * pageSize, state.creditPage * pageSize + pageSize);
    return `
      <div class="jv-kpi-pop credit">
        <div class="jv-kpi-pop-head">
          <div>
            <div class="t">Credit limit</div>
            <div class="s">${escapeHtml(kpi.detail)} · last review ${escapeHtml(credit.lastReview)}</div>
          </div>
          <span class="jv-kpi-state ${escapeHtml(kpi.kind)}">${kpi.kind === "success" ? "Approved" : "No limit"}</span>
        </div>
        <div class="jv-credit-stats compact">
          <div><span class="k">Approved</span><span class="v jv-mono">R$ ${credit.approved}m</span></div>
          <div><span class="k">Used</span><span class="v jv-mono">R$ ${credit.used}m</span></div>
          <div><span class="k">Available</span><span class="v jv-mono ok">R$ ${credit.available}m</span></div>
        </div>
        <div class="jv-pop-filter">
          <label>Counterparty</label>
          <input data-input="credit-filter" type="search" placeholder="Filter counterparties..." value="${escapeHtml(state.creditFilter)}" />
        </div>
        <div class="jv-credit-table-wrap">
          <table class="jv-credit-table">
            <thead><tr><th>Counterparty</th><th>Approved</th><th>Used</th><th>Available</th></tr></thead>
            <tbody>
              ${pageRows.map((row) => `
                <tr>
                  <td>${escapeHtml(row.name)}</td>
                  <td class="num">R$ ${row.approved}m</td>
                  <td class="num">R$ ${row.used}m</td>
                  <td class="num ok">R$ ${row.available}m</td>
                </tr>
              `).join("")}
              ${pageRows.length ? "" : `<tr><td colspan="4" class="empty">No counterparties match this filter.</td></tr>`}
            </tbody>
          </table>
        </div>
        <div class="jv-pop-pager">
          <span>${rows.length ? `${state.creditPage * pageSize + 1}-${Math.min(rows.length, (state.creditPage + 1) * pageSize)} of ${rows.length}` : "0 counterparties"}</span>
          <button data-action="credit-page" data-dir="-1" ${state.creditPage === 0 ? "disabled" : ""}>Prev</button>
          <button data-action="credit-page" data-dir="1" ${state.creditPage >= maxPage ? "disabled" : ""}>Next</button>
        </div>
      </div>
    `;
  }

  function renderHitRatioChip() {
    const fx = data.hitRatio.fx;
    const ndf = data.hitRatio.ndf;
    return `
      <div class="jv-kpi-wrap">
        <button class="jv-kpi-chip info ${state.hrOpen ? "open" : ""}" data-action="toggle-hr">
          ${icon("grid", 13)}
          <span class="lab">Hit ratio</span>
          <span class="v">FX ${fx.pct}% · NDF ${ndf.pct}%</span>
          ${icon("chevD", 11)}
        </button>
        ${state.hrOpen ? renderHitRatioPopover() : ""}
      </div>
    `;
  }

  function renderHitRatioPopover() {
    return `
      <div class="jv-kpi-pop hr">
        <div class="jv-kpi-pop-head">
          <div>
            <div class="t">Hit ratio</div>
            <div class="s">${escapeHtml(data.hitRatio.period)} · FX and NDF</div>
          </div>
        </div>
        <div class="jv-hr-pair compact">
          ${renderHitRatioCell("FX", data.hitRatio.fx, "var(--blue-60)")}
          ${renderHitRatioCell("NDF", data.hitRatio.ndf, "var(--navy-70)")}
        </div>
        <div class="jv-hr-platforms compact">
          ${data.hitRatio.platforms.map((platform) => `
            <div class="jv-hr-platform">
              <span class="name">${escapeHtml(platform.name)}</span>
              <span class="share-bar"><i style="width: ${platform.share}%"></i></span>
              <span class="share">${platform.share}%</span>
              <span class="hit">${platform.pct}% hit</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  function renderInsightsPanel() {
    const visibleInsights = data.nba.insights.filter((insight, index) => !state.actedInsights.has(insightId(insight, index)));
    const signalToggleLabel = state.jarvisSignalsCollapsed ? "Show Insights" : "Hide Insights";
    return `
      ${state.insightsOpen ? "" : `<button class="jv-jarvis-fab" data-action="toggle-insights" aria-expanded="false" title="Open Jarvis">
        ${jarvisLogo(state.thinking ? "thinking" : "idle", 46)}
        ${visibleInsights.length ? `<span class="jv-signal-bubble">${visibleInsights.length}</span>` : ""}
      </button>`}
      ${state.insightsOpen ? `
        <div class="jv-insights-backdrop ${state.jarvisFullscreen ? "fullscreen" : ""}" data-action="close-insights"></div>
        <aside class="jv-insights-drawer ${state.jarvisFullscreen ? "fullscreen" : ""} ${state.jarvisSignalsCollapsed ? "signals-collapsed" : ""}" aria-label="Jarvis chat">
          <header class="jv-insights-head">
            ${jarvisLogo(state.thinking ? "thinking" : "idle", 42)}
            <div>
              <div class="summary">
                ${visibleInsights.length ? `<button class="jv-insights-head-toggle" data-action="toggle-jarvis-signals">
                  <span>${signalToggleLabel}</span>
                  <b>${visibleInsights.length}</b>
                </button>` : `<span>No insights</span>`}
                <span class="jv-insights-sync">Updated 2 min ago ${renderStateBadges("insights")}</span>
              </div>
            </div>
            <button class="jv-icon-mini" data-action="toggle-jarvis-fullscreen" title="${state.jarvisFullscreen ? "Exit fullscreen" : "Fullscreen"}">${icon(state.jarvisFullscreen ? "chevD" : "expand", 15)}</button>
            <button class="jv-icon-mini" data-action="close-insights" title="Close Jarvis">${icon("close", 16)}</button>
          </header>
          ${panelError("insights") ? renderPanelError("insights", "Couldn't refresh Jarvis signals.", "Background scan feed unavailable.") : isLoading("insights") ? renderInsightsSkeleton() : visibleInsights.length && !state.jarvisSignalsCollapsed ? `
            <div class="jv-signal-stage">
              <div class="jv-signal-scroller">
                <div class="jv-signal-grid single-row">
                  ${visibleInsights.map(renderInsight).join("")}
                </div>
              </div>
              ${renderInsightDislikeForm()}
            </div>
          ` : visibleInsights.length ? "" : renderEmptyState("info", "No insights", "Jarvis hasn't flagged anything new. Background scan running.")}
          <div class="jv-ask-wrap plain">${renderAskJarvis()}</div>
        </aside>
      ` : ""}
    `;
  }

  function renderNextBestAction() {
    return `
      <section class="jv-nba">
        <header class="jv-nba-head">
          <span class="jv-nba-eyebrow">${icon("sparkle", 11)} Jarvis insights</span>
          <span class="jv-nba-meta">${data.nba.insights.length} signals · updated 2 min ago</span>
        </header>
        <div class="jv-nba-grid">
          <div class="jv-insight-row">
            ${data.nba.insights.map(renderInsight).join("")}
          </div>
          <div class="jv-ask-wrap">
            ${renderAskJarvis()}
          </div>
        </div>
      </section>
    `;
  }

  function insightId(insight) {
    return insight.label;
  }

  function renderInsight(insight, index = 0) {
    const id = insightId(insight, index);
    const arrived = state.arrivedInsights.has(id);
    const feedback = state.insightFeedback[id];
    const dislikeActive = state.insightDislikeTarget === id;
    const heatColor = insight.heat >= 82 ? "var(--blue-60)" : insight.heat >= 58 ? "var(--blue-40)" : insight.heat >= 32 ? "#8aa4cf" : "var(--gray-50)";
    const heatBg = insight.heat >= 82 ? "rgba(0,87,217,.10)" : insight.heat >= 58 ? "rgba(111,160,255,.12)" : insight.heat >= 32 ? "rgba(138,164,207,.12)" : "rgba(140,146,163,.10)";
    return `
      <div class="jv-insight jv-signal-card ${index === 0 ? "next" : ""} ${arrived ? "arrived" : ""} ${dislikeActive ? "feedback-open" : ""}" style="--heat-color:${heatColor};--heat-bg:${heatBg};--heat:${insight.heat}%">
        <div class="kpi">${escapeHtml(insight.kpi)}</div>
        <div class="label">${escapeHtml(insight.label)}</div>
        <div class="detail">${escapeHtml(insight.detail)}</div>
        <div class="jv-feedback-row" aria-label="Insight feedback">
          <button class="jv-feedback-btn ${feedback?.vote === "like" ? "active" : ""}" data-action="like-insight" data-insight-id="${escapeHtml(id)}" title="Useful — dismiss" aria-label="Mark insight useful and dismiss">${icon("thumbUp", 12)}</button>
          <button class="jv-feedback-btn ${feedback?.vote === "dislike" ? "active dislike" : dislikeActive ? "dislike pending" : ""}" data-action="dislike-insight" data-insight-id="${escapeHtml(id)}" data-insight-label="${escapeHtml(insight.label)}" title="Not useful — send feedback" aria-label="Explain why this insight is not useful">${icon("thumbDown", 12)}</button>
          ${feedback ? `<span class="jv-feedback-status">${feedback.vote === "like" ? "Useful" : "Sent"}</span>` : ""}
        </div>
      </div>
    `;
  }

  function renderInsightDislikeForm() {
    if (!state.insightDislikeTarget) return "";
    const insight = data.nba.insights.find((candidate) => insightId(candidate) === state.insightDislikeTarget);
    return `
      <form class="jv-signal-feedback-form" data-form="insight-feedback">
        <div>
          <div class="label">Why was this not useful?</div>
          <div class="target">${escapeHtml(insight?.label || "Selected signal")}</div>
        </div>
        <textarea data-input="insight-dislike" rows="2" placeholder="Missing context, wrong timing, already known, or not actionable...">${escapeHtml(state.insightDislikeDraft)}</textarea>
        <div class="foot">
          ${state.insightFeedbackError ? `<span class="err">${escapeHtml(state.insightFeedbackError)}</span>` : "<span></span>"}
          <button type="button" class="jv-btn ghost sm" data-action="cancel-insight-dislike">Cancel</button>
          <button type="button" class="jv-btn primary sm" data-action="submit-insight-dislike" ${state.insightDislikeDraft.trim() ? "" : "disabled"}>Send</button>
        </div>
      </form>
    `;
  }

  function renderAskJarvis() {
    return `
      <div class="jv-ask">
        <div class="jv-ask-stream" data-region="ask-stream">
          ${state.chat.map((message) => `
            <div class="jv-ask-msg ${message.who === "Jarvis" ? "jarvis" : "user"}">
              <div class="head">
                <span class="who">${message.who === "Jarvis" ? jarvisLogo("idle", 14) : ""}${escapeHtml(message.who)}</span>
                <span class="ts">${escapeHtml(message.ts)}</span>
              </div>
              <div class="text">${escapeHtml(message.text)}</div>
            </div>
          `).join("")}
          ${state.thinking ? `
            <div class="jv-ask-thinking" role="status" aria-live="polite">
              ${jarvisLogo("thinking", 34)}
              <span class="jv-thinking-words">
                <i>Reading</i>
                <i>Linking</i>
                <i>Pricing</i>
                <i>Drafting</i>
              </span>
            </div>
          ` : ""}
        </div>
        <div class="jv-ask-input">
          ${jarvisLogo(state.thinking ? "thinking" : "idle", 20)}
          <textarea data-input="ask" rows="1" placeholder="Ask Jarvis anything about Vale...">${escapeHtml(state.askDraft)}</textarea>
          <button class="send" data-action="send-ask" ${cleanText(state.askDraft) ? "" : "disabled"} title="Send">${icon("send", 14)}</button>
        </div>
      </div>
    `;
  }

  function renderCard(id, title, badge, actions, body, className = "") {
    const open = state.cardOpen[id] !== false;
    const badges = `${badge ? `<span>${badge}</span>` : ""}${renderStateBadges(id)}`;
    const panelIndex = state.panelOrder.indexOf(id);
    const customizeTools = state.customizeMode && panelIndex >= 0 ? `
      <div class="jv-custom-tools" aria-label="Customize ${escapeHtml(title)} panel">
        <button data-action="custom-move" data-card-id="${escapeHtml(id)}" data-dir="-1" ${panelIndex === 0 ? "disabled" : ""} title="Move panel up">↑</button>
        <button data-action="custom-move" data-card-id="${escapeHtml(id)}" data-dir="1" ${panelIndex === state.panelOrder.length - 1 ? "disabled" : ""} title="Move panel down">↓</button>
      </div>
    ` : "";
    return `
      <section class="jv-card ${open ? "open" : "collapsed"} ${className} ${isUpdated(id) ? "jv-updated" : ""}" data-card="${escapeHtml(id)}">
        ${isRefreshing(id) ? '<div class="jv-refresh-bar"><i></i></div>' : ""}
        <header class="jv-card-head">
          <button class="jv-card-toggle" data-action="toggle-card" data-card-id="${escapeHtml(id)}" title="${open ? "Collapse" : "Expand"}">${icon(open ? "chevD" : "chevR", 14)}</button>
          <h3 class="jv-card-title">${escapeHtml(title)}</h3>
          ${badges.trim() ? `<span class="jv-card-badge">${badges}</span>` : ""}
          ${customizeTools}
          <div class="jv-card-actions">${actions || ""}</div>
        </header>
        ${open ? `<div class="jv-card-body">${body}</div>` : ""}
        ${state.customizeMode ? '<span class="jv-resize-handle"></span>' : ""}
      </section>
    `;
  }

  function renderNotesCard() {
    const totalNotes = data.notes.personal.length + data.notes.team.length;
    const actions = `
      <div class="jv-seg jv-notes-tabs">
        ${renderSegmentButton("notes-tab", "all", `All · ${totalNotes}`, state.notesTab === "all")}
        ${renderSegmentButton("notes-tab", "personal", `Personal · ${data.notes.personal.length}`, state.notesTab === "personal")}
        ${renderSegmentButton("notes-tab", "team", `Team · ${data.notes.team.length}`, state.notesTab === "team")}
      </div>
    `;
    if (!state.clientSelected) {
      return renderCard("notes", "Notes", "No client", actions, renderEmptyState("info", "No client selected", "Search a client to load notes."));
    }
    if (panelError("notes")) {
      return renderCard("notes", "Notes", `${escapeHtml(data.client.group)} · ${totalNotes} notes`, actions, renderPanelError("notes", "Couldn't reach notes.", "CRM notes feed unavailable."));
    }
    if (isLoading("notes")) {
      return renderCard("notes", "Notes", `${escapeHtml(data.client.group)} · loading`, actions, renderNotesSkeleton());
    }
    const visibleNotes = getVisibleNotes();
    const body = `
      ${renderComposer()}
      <div class="jv-notes-stream">
        ${visibleNotes.length ? visibleNotes.map((entry) => renderNote(entry.note, entry.scope)).join("") : renderEmptyState("info", "No notes", "No notes yet. Use the editor below or press the mic to capture one live.")}
      </div>
    `;
    return renderCard("notes", "Notes", `${escapeHtml(data.client.group)} · ${totalNotes} notes`, actions, body);
  }

  function renderSegmentButton(type, value, label, active) {
    return `<button class="jv-seg-btn ${active ? "active" : ""}" data-action="${escapeHtml(type)}" data-value="${escapeHtml(value)}">${escapeHtml(label)}</button>`;
  }

  function renderComposer() {
    const composerHasContent = Boolean(cleanText(state.composerHtml));
    return `
      <div class="jv-merged-composer scope-${state.composerScope} ${state.listening ? "listening" : ""}">
        <div class="jv-mc-top">
          <div class="jv-mc-scope">
            <button class="jv-mc-scope-btn ${state.composerScope === "personal" ? "active" : ""}" data-action="composer-scope" data-value="personal">
              <span class="dot personal"></span>Personal
            </button>
            <button class="jv-mc-scope-btn ${state.composerScope === "team" ? "active" : ""}" data-action="composer-scope" data-value="team">
              <span class="dot team"></span>Team
            </button>
          </div>
          <div class="jv-mc-status" data-region="composer-status">${renderComposerStatus()}</div>
        </div>
        <div class="jv-rich-area" contenteditable="true" data-editor="composer" data-empty="${composerHasContent ? "false" : "true"}" data-placeholder="${state.composerScope === "personal" ? "Write a personal note — or tap the mic to dictate. Use # for tags." : "Write a team note (visible to FICC desk) — or tap the mic to dictate."}" style="min-height: 66px">${state.composerHtml}</div>
        <div class="jv-mc-toolbar">
          ${renderEditorButton("bold", "B")}
          ${renderEditorButton("italic", "I")}
          ${renderEditorButton("underline", "U")}
          <span class="sep"></span>
          ${renderEditorButton("formatBlock", "H", "<h3>")}
          ${renderEditorButton("insertUnorderedList", "•")}
          ${renderEditorButton("insertOrderedList", "1.")}
          <span class="sep"></span>
          ${renderEditorButton("insertText", "#", "#")}
          <div class="jv-mc-actions">
            <button class="jv-link-btn" data-action="clear-composer" ${composerHasContent ? "" : "hidden"}>${icon("close", 11)} Clear</button>
            <button class="jv-mc-mic ${state.listening ? "listening" : ""}" data-action="toggle-dictation" title="${state.listening ? "Stop dictation" : "Tap to dictate"}">
              ${icon("mic", 16)}
            </button>
            <button class="jv-btn primary sm" data-action="save-composer" ${composerHasContent ? "" : "disabled"}>${icon("check", 11)} Save ${state.composerScope === "personal" ? "personal" : "team"}</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderComposerStatus() {
    if (state.listening) {
      return `<span class="live">${jarvisLogo("thinking", 16)}<span class="livedot"></span>Jarvis listening · ${state.voiceWords.length ? `<span class="jv-voice-words">${state.voiceWords.map((word) => `<i>${escapeHtml(word)}</i>`).join(" ")}</span>` : "0:42"}</span>`;
    }
    if (state.savingStatus) return `<span class="dictated">${escapeHtml(state.savingStatus)}</span>`;
    if (state.hasDictated) return `<span class="dictated">${jarvisLogo("idle", 16)}Drafted by Jarvis · edit freely</span>`;
    return '<span class="hint">Click a tag chip or type #word</span>';
  }

  function renderEditorButton(command, label, value = "") {
    return `<button data-action="editor-command" data-command="${escapeHtml(command)}" data-value="${escapeHtml(value)}" title="${escapeHtml(label)}">${label}</button>`;
  }

  function getVisibleNotes() {
    if (state.notesTab === "all") {
      return [
        ...data.notes.personal.map((note) => ({ scope: "personal", note })),
        ...data.notes.team.map((note) => ({ scope: "team", note })),
      ].sort((left, right) => String(right.ts).localeCompare(String(left.ts)));
    }
    return data.notes[state.notesTab].map((note) => ({ scope: state.notesTab, note }));
  }

  function renderNote(note, scope) {
    const key = noteKey(scope, note);
    const isTeam = scope === "team";
    const expanded = state.expandedNotes.has(key);
    const pendingDelete = state.pendingConfirm === `delete-note:${key}`;
    const shouldFold = note.body.length > 520 && !expanded;
    const initials = (note.author || "?").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
    const tags = [...new Set([...(note.body || "").matchAll(/#([\w-]+)/g)].map((match) => match[1]))];
    return `
      <article class="jv-note ${isTeam ? "team" : "personal"}">
        <header class="jv-note-head">
          <div class="jv-note-head-left">
            ${isTeam ? `<span class="author-pill"><span class="av">${escapeHtml(initials)}</span>${escapeHtml(note.author)}</span>` : `<span class="author-personal"><span class="dot"></span>${escapeHtml(note.author)}</span>`}
            <span class="ts">${escapeHtml(note.ts)}</span>
          </div>
          <div class="jv-note-head-right">
            ${tags.slice(0, 3).map((tag) => `<span class="jv-htag mini">#${escapeHtml(tag)}</span>`).join("")}
            ${pendingDelete ? `
              <span class="jv-inline-confirm">
                <span>Confirm?</span>
                <button data-action="confirm-delete-note" data-note-key="${escapeHtml(key)}">Delete</button>
                <button data-action="cancel-confirm">Cancel</button>
              </span>
            ` : `<button class="jv-icon-mini" title="Delete note" data-action="delete-note" data-note-key="${escapeHtml(key)}">${icon("trash", 13)}</button>`}
            <button class="jv-icon-mini" title="Focus mode" data-action="open-note" data-note-key="${escapeHtml(key)}">${icon("expand", 13)}</button>
          </div>
        </header>
        <div class="jv-note-body ${shouldFold ? "folded" : ""}">${note.body}</div>
        ${note.body.length > 520 ? `
          <div class="jv-note-foldrow">
            ${expanded ? `<button class="jv-link-btn" data-action="toggle-note-fold" data-note-key="${escapeHtml(key)}">${icon("chevU", 12)} Collapse</button>` : `
              <button class="jv-link-btn" data-action="toggle-note-fold" data-note-key="${escapeHtml(key)}">${icon("chevD", 12)} Show full</button>
              <button class="jv-link-btn" data-action="open-note" data-note-key="${escapeHtml(key)}">${icon("expand", 11)} Focus mode</button>
            `}
          </div>
        ` : ""}
      </article>
    `;
  }

  function renderFocusModal() {
    const found = findNote(state.focusNoteKey);
    if (!found) return "";
    const { scope, note } = found;
    const isTeam = scope === "team";
    const initials = (note.author || "?").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
    return `
      <div class="jv-modal-scrim">
        <div class="jv-focus-modal scope-${isTeam ? "team" : "personal"}">
          <header class="jv-focus-head">
            <div class="meta">
              ${isTeam ? `<span class="author-pill"><span class="av">${escapeHtml(initials)}</span>${escapeHtml(note.author)}</span>` : `<span class="author-personal"><span class="dot"></span>${escapeHtml(note.author)}</span>`}
              <span class="ts">${escapeHtml(note.ts)}</span>
              <span class="jv-scope-tag ${isTeam ? "team" : "personal"}">${isTeam ? "Team" : "Personal"}</span>
            </div>
            <div class="actions">
              ${state.focusEdit ? `
                <button class="jv-btn ghost" data-action="modal-cancel">Cancel</button>
                <button class="jv-btn primary" data-action="modal-save">${icon("check", 12)} Save</button>
              ` : `<button class="jv-btn" data-action="modal-edit">${icon("pencil", 12)} Edit</button>`}
              <button class="jv-icon-mini" data-action="close-modal" title="Close">${icon("close", 16)}</button>
            </div>
          </header>
          <div class="jv-focus-body">
            ${state.focusEdit ? `
              <div class="jv-mc-toolbar standalone">
                ${renderModalEditorButton("bold", "B")}
                ${renderModalEditorButton("italic", "I")}
                ${renderModalEditorButton("underline", "U")}
                <span class="sep"></span>
                ${renderModalEditorButton("formatBlock", "H", "<h3>")}
                ${renderModalEditorButton("insertUnorderedList", "•")}
                ${renderModalEditorButton("insertOrderedList", "1.")}
                <span class="sep"></span>
                ${renderModalEditorButton("insertText", "#", "#")}
              </div>
              <div class="jv-rich-area" contenteditable="true" data-editor="modal" data-empty="false" data-placeholder="Write the note..." style="min-height: 440px">${state.focusHtml}</div>
            ` : `<div class="jv-focus-render">${state.focusHtml || note.body}</div>`}
          </div>
          <footer class="jv-focus-foot">
            <span>${icon("bookmark", 11)} Tags via #word in text</span>
            <span style="margin-left:auto">Esc to close</span>
          </footer>
        </div>
      </div>
    `;
  }

  function renderModalEditorButton(command, label, value = "") {
    return `<button data-action="modal-editor-command" data-command="${escapeHtml(command)}" data-value="${escapeHtml(value)}" title="${escapeHtml(label)}">${label}</button>`;
  }

  function renderHitRatioCard() {
    if (!state.clientSelected) {
      return renderCard("hr", "Hit ratio", "No client", "", renderEmptyState("info", "No client selected", "Search a client to load hit ratio."));
    }
    if (panelError("hr")) {
      return renderCard("hr", "Hit ratio", escapeHtml(data.hitRatio.period), "", renderPanelError("hr", "Couldn't reach hit-ratio feed.", "Quoting platform feed unavailable."));
    }
    if (isLoading("hr")) {
      return renderCard("hr", "Hit ratio", "Loading", "", renderHitRatioSkeleton());
    }
    const body = `
      <div class="jv-hr-pair">
        ${renderHitRatioCell("FX", data.hitRatio.fx, "var(--blue-60)")}
        ${renderHitRatioCell("NDF", data.hitRatio.ndf, "var(--navy-70)")}
      </div>
      <div class="jv-hr-platforms">
        <div class="head">Quoting platforms · share &amp; hit rate</div>
        ${data.hitRatio.platforms.map((platform) => `
          <div class="jv-hr-platform">
            <span class="name">${escapeHtml(platform.name)}</span>
            <span class="share-bar"><i style="width: ${platform.share}%"></i></span>
            <span class="share">${platform.share}%</span>
            <span class="sep">·</span>
            <span class="hit">${platform.pct}% hit</span>
            <span class="cnt jv-mono">${platform.closed}/${platform.quoted}</span>
          </div>
        `).join("")}
      </div>
    `;
    return renderCard("hr", "Hit ratio", escapeHtml(data.hitRatio.period), "", body);
  }

  function renderHitRatioCell(label, value, color) {
    return `
      <div class="jv-hr-cell ${isUpdated("hr") ? "jv-number-tick" : ""}">
        <div class="head">
          <span class="prod">${escapeHtml(label)}</span>
          <span class="delta ${value.deltaPp >= 0 ? "pos" : "neg"}">${value.deltaPp >= 0 ? "+" : ""}${value.deltaPp} pp</span>
        </div>
        <div class="big" style="color: ${color}">${value.pct}<small>%</small></div>
        <div class="meta"><span class="jv-mono">${value.closed}</span> closed of <span class="jv-mono">${value.quoted}</span> quoted</div>
        <div class="jv-hr-bar"><i style="width: ${value.pct}%; background: ${color}"></i></div>
        <div class="prior">prior period <span class="jv-mono">${value.prior}%</span></div>
      </div>
    `;
  }

  function renderDocumentsCard() {
    const actions = state.docDrill
      ? `<button class="jv-link-btn" data-action="doc-back">${icon("chevR", 12)} Back to summary</button>`
      : "";
    if (!state.clientSelected) {
      return renderCard("docs", "Documents & credit", "No client", actions, renderEmptyState("info", "No client selected", "Search a client to load documents and credit."));
    }
    if (panelError("docs")) {
      return renderCard("docs", "Documents & credit", "Error", actions, renderPanelError("docs", "Couldn't load Documents.", "Couldn't reach the document vault. This usually clears in a moment."));
    }
    if (isLoading("docs")) {
      return renderCard("docs", "Documents & credit", "Loading", actions, renderDocumentsSkeleton());
    }
    const body = state.docDrill ? renderDocumentDetail(state.docDrill) : renderDocumentSummary();
    return renderCard("docs", "Documents & credit", state.docDrill ? "" : "Summary", actions, body);
  }

  function renderDocumentSummary() {
    const credit = data.documents.credit;
    const summaries = [
      { key: "cgd", label: "CGD", value: '<span class="status ok">Active</span>', meta: `${data.documents.cgd.count} files · since ${data.documents.cgd.since}` },
      { key: "fx", label: "FX", value: '<span class="status ok">Active</span>', meta: `${data.documents.fx.count} files · since ${data.documents.fx.since}` },
      { key: "credit", label: "Credit", value: `<span class="status mono">${credit.utilization}% used</span>`, meta: `R$ ${credit.used}m of R$ ${credit.approved}m approved` },
    ];
    return `
      <div class="jv-doc-summary">
        ${summaries.map((summary) => `
          <button class="jv-doc-summary-card" data-action="doc-drill" data-value="${escapeHtml(summary.key)}">
            <div class="lab">${escapeHtml(summary.label)}</div>
            <div class="val">${summary.value}</div>
            <div class="meta">${escapeHtml(summary.meta)}</div>
            ${summary.key === "credit" ? `<div class="bar"><i style="width: ${credit.utilization}%"></i></div>` : ""}
            <span class="open">${icon("arrowR", 12)}</span>
          </button>
        `).join("")}
      </div>
    `;
  }

  function renderDocumentDetail(kind) {
    if (kind === "credit") {
      const credit = data.documents.credit;
      return `
        <div class="jv-doc-detail">
          <div class="head">
            <div>
              <div class="t">Credit limit utilization</div>
              <div class="s">Last review ${escapeHtml(credit.lastReview)} · trend ${escapeHtml(credit.trend)}</div>
            </div>
            <span class="status mono big">${credit.utilization}%</span>
          </div>
          <div class="jv-credit-bar big"><i class="amber" style="width: ${credit.utilization}%"></i></div>
          <div class="jv-credit-stats">
            <div><span class="k">Approved</span><span class="v jv-mono">R$ ${credit.approved}m</span></div>
            <div><span class="k">Used</span><span class="v jv-mono">R$ ${credit.used}m</span></div>
            <div><span class="k">Available</span><span class="v jv-mono ok">R$ ${credit.available}m</span></div>
          </div>
          <table class="jv-table">
            <thead><tr><th>Line</th><th class="num">Approved (R$ m)</th><th class="num">Used</th><th class="num">Util.</th></tr></thead>
            <tbody>
              ${credit.items.map((item) => `
                <tr>
                  <td class="${item.line.startsWith("  ") ? "indent" : ""}">${escapeHtml(item.line.trim())}</td>
                  <td class="num jv-mono">${item.approved}</td>
                  <td class="num jv-mono">${item.used}</td>
                  <td class="num jv-mono">${item.util}%</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;
    }

    const documentSet = data.documents[kind];
    const title = kind === "cgd" ? "CGD · Master Derivatives" : "FX · Câmbio framework";
    return `
      <div class="jv-doc-detail">
        <div class="head">
          <div>
            <div class="t">${title}</div>
            <div class="s">${documentSet.count} files · last update ${escapeHtml(documentSet.lastUpdate)}</div>
          </div>
          ${docStatusBadge("active")}
        </div>
        <ul class="jv-doc-list">
          ${documentSet.items.map((item) => `
            <li>
              ${icon("fileText", 14)}
              <div class="name">${escapeHtml(item.name)}<span class="sub">${escapeHtml(item.sub)}</span></div>
              <span class="date jv-mono">${escapeHtml(item.date)}</span>
              ${docStatusBadge(item.status)}
            </li>
          `).join("")}
        </ul>
      </div>
    `;
  }

  function docStatusBadge(kind) {
    if (kind === "active") return `<span class="jv-doc-badge ok">${icon("check", 10)} Active</span>`;
    if (kind === "warning") return `<span class="jv-doc-badge warn">${icon("warning", 10)} Renewal due</span>`;
    if (kind === "pending") return `<span class="jv-doc-badge pend">${icon("clock", 10)} Pending</span>`;
    return "";
  }

  function renderBookCard() {
    const actions = `
      <div class="jv-seg">
        ${renderSegmentButton("book-view", "positions", "Positions", state.bookView === "positions")}
        ${renderSegmentButton("book-view", "trades", "Trades · 30d", state.bookView === "trades")}
      </div>
      <button class="jv-icon-mini" title="Export">${icon("download", 14)}</button>
    `;
    if (!state.clientSelected) {
      return renderCard("book", "Book", "No client", actions, renderEmptyState("info", "No client selected", "Search a client to load positions and trades."));
    }
    if (panelError("book")) {
      return renderCard("book", "Book", `${escapeHtml(data.client.group)} · feed error`, actions, renderPanelError("book", "Couldn't reach the trades feed.", "This usually clears in a moment."));
    }
    if (isLoading("book")) {
      return renderCard("book", "Book", `${escapeHtml(data.client.group)} · loading`, actions, renderBookSkeleton());
    }
    const body = `
      ${renderBookTabs()}
      ${renderBookToolbar()}
      ${renderBookRows()}
    `;
    return renderCard("book", "Book", `${escapeHtml(data.client.group)} · ${state.bookView === "positions" ? "Live positions" : "Closed trades"}`, actions, body);
  }

  function renderBookTabs() {
    return `
      <div class="jv-book-tabs">
        ${data.book.products.map((product) => {
          const count = (data.book[state.bookView][product] || []).length;
          return `<button class="jv-book-tab ${state.bookProduct === product ? "active" : ""}" data-action="book-product" data-value="${escapeHtml(product)}">${escapeHtml(product)}<span class="ct">${count}</span></button>`;
        }).join("")}
      </div>
    `;
  }

  function getBookBaseRows() {
    return data.book[state.bookView][state.bookProduct] || [];
  }

  function getBookRows() {
    return getBookBaseRows().filter((row) => state.memberFilter === "all" || row.company === state.memberFilter);
  }

  function renderBookToolbar() {
    const baseRows = getBookBaseRows();
    const memberOptions = ["all", ...new Set(baseRows.map((row) => row.company))];
    return `
      <div class="jv-book-toolbar">
        <span class="lab">Filter by member</span>
        <select class="jv-select" data-input="member-filter">
          ${memberOptions.map((option) => `
            <option value="${escapeHtml(option)}" ${state.memberFilter === option ? "selected" : ""}>${option === "all" ? `All members (${baseRows.length})` : escapeHtml(option)}</option>
          `).join("")}
        </select>
        <span style="margin-left:auto;font-size:11px;color:var(--text-tertiary)">${getBookRows().length} rows</span>
      </div>
    `;
  }

  function renderBookRows() {
    const rows = getBookRows();
    if (!rows.length) {
      return `
        <div class="jv-book-empty">
          ${icon("layers", 20)}
          <div class="t">No open ${escapeHtml(state.bookProduct)} ${escapeHtml(state.bookView)} for ${escapeHtml(data.client.group)}.</div>
          <div class="s">${state.bookView === "positions" ? `No open positions in this product for ${escapeHtml(data.client.group)}.` : "No closed trades in the selected window."}</div>
        </div>
      `;
    }

    const columns = state.bookView === "positions"
      ? [
          { label: "Company", cls: "col-company", width: "25%" },
          { label: "Side", cls: "center col-side", width: "9%" },
          { label: "Notional", cls: "num col-notional", width: "14%" },
          { label: "Strike / Rate", cls: "num col-rate", width: "14%" },
          { label: "Maturity", cls: "num col-date", width: "13%" },
          { label: "Days", cls: "num col-days", width: "9%" },
          { label: "MTM (R$ m)", cls: "num col-mtm", width: "16%" },
        ]
      : [
          { label: "Date", cls: "col-date", width: "11%" },
          { label: "Company", cls: "col-company", width: "23%" },
          { label: "Side", cls: "center col-side", width: "9%" },
          { label: "Notional", cls: "num col-notional", width: "15%" },
          { label: "Rate", cls: "num col-rate", width: "13%" },
          { label: "Spread (bps)", cls: "num col-spread", width: "16%" },
          { label: "Seller", cls: "col-seller", width: "13%" },
        ];
    return `
      <div class="jv-book-tablewrap">
        <table class="jv-table">
          <colgroup>${columns.map((column) => `<col style="width:${column.width}">`).join("")}</colgroup>
          <thead>
            <tr>${columns.map((column) => `<th class="${column.cls}">${escapeHtml(column.label)}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${rows.map((row) => state.bookView === "positions" ? renderPositionRow(row) : renderTradeRow(row)).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function sideClass(side) {
    return String(side).toLowerCase().replaceAll(" ", "-").replaceAll("/", "-");
  }

  function renderPositionRow(row) {
    const mtmClass = row.mtm > 0 ? "pos" : row.mtm < 0 ? "neg" : "";
    const daysColor = row.days <= 4 ? "var(--red-60)" : row.days <= 30 ? "var(--amber-60)" : "var(--text-primary)";
    return `
      <tr class="${row.urgent === "critical" ? "row-critical" : row.urgent === "urgent" ? "row-urgent" : ""}">
        <td class="company">${escapeHtml(row.company)}<span class="row-secondary">DV01 ${escapeHtml(row.dv01 || "n/a")} · Δ ${row.mtm > 0 ? "+" : ""}${formatNumber(row.mtm / 10)}</span></td>
        <td class="center"><span class="pill side-${sideClass(row.side)}">${escapeHtml(row.side)}</span></td>
        <td class="num">${escapeHtml(row.notional)}</td>
        <td class="num jv-mono">${escapeHtml(row.rate)}</td>
        <td class="num jv-mono">${escapeHtml(row.maturity)}</td>
        <td class="num"><span style="font-weight:${row.days <= 7 ? 600 : 400};color:${daysColor}">${row.days}d</span></td>
        <td class="num ${mtmClass} ${isUpdated("book") ? "jv-number-tick" : ""}">${row.mtm > 0 ? "+" : ""}${formatNumber(row.mtm)}</td>
      </tr>
    `;
  }

  function renderTradeRow(row) {
    return `
      <tr class="jv-trade-row" data-tooltip="${escapeHtml(`${row.company} · ${row.seller} desk · counterparty metadata reconciled`)}">
        <td class="jv-mono">${escapeHtml(row.date)}</td>
        <td class="company">${escapeHtml(row.company)}</td>
        <td class="center"><span class="pill side-${sideClass(row.side)}">${escapeHtml(row.side)}</span></td>
        <td class="num">${escapeHtml(row.notional)}</td>
        <td class="num jv-mono">${escapeHtml(row.rate)}</td>
        <td class="num spread-cell"><span class="jv-spread-bar"><i style="width: ${(row.spread / row.spreadMax) * 100}%"></i></span>${row.spread}</td>
        <td class="seller">${escapeHtml(row.seller)}</td>
      </tr>
    `;
  }

  function renderDevControls() {
    return `
      <div class="jv-dev">
        <button class="jv-dev-pill" data-action="toggle-dev" title="Demo controls · Shift+D">Demo</button>
        ${state.devOpen ? `
          <div class="jv-dev-panel">
            <div class="head">
              <strong>State demo</strong>
              <span>Shift+D</span>
            </div>
            <button data-action="demo-reload">${icon("retry", 12)} Reload Vale</button>
            <button data-action="demo-refresh-pl">${icon("retry", 12)} Refresh P&amp;L</button>
            <button data-action="demo-stale-mtm">${icon("clock", 12)} Simulate stale MTM</button>
            <button data-action="demo-doc-error">${icon("error", 12)} Error: Documents</button>
            <button data-action="demo-insight">${icon("sparkle", 12)} Trigger insight</button>
            <button data-action="demo-ticket">${icon("ticket", 12)} Open trade ticket</button>
            <button data-action="demo-voice">${icon("mic", 12)} Voice mode demo</button>
            <button data-action="demo-disconnect">${icon("warning", 12)} Disconnect</button>
            <button data-action="demo-reconnect">${icon("check", 12)} Reconnect</button>
            <button data-action="demo-clear-client">${icon("search", 12)} Clear client</button>
          </div>
        ` : ""}
      </div>
    `;
  }

  function setPanelsLoading(panels) {
    panels.forEach((panel) => {
      state.loadingPanels.add(panel);
      delete state.errors[panel];
    });
  }

  function reloadVale() {
    state.clientSelected = true;
    state.bookProduct = "NDF";
    state.bookView = "trades";
    state.searchOpen = false;
    state.searchQuery = "";
    setPanelsLoading(["relationship", "coverage", "pl", "notes", "hr", "docs", "book", "insights"]);
    renderApp();
    window.setTimeout(() => {
      ["relationship", "coverage", "pl", "notes", "hr", "docs", "book", "insights"].forEach(clearPanel);
      state.lastSync = currentTime();
      flash("relationship");
      pushToast("success", "Vale loaded", "Full client picture refreshed.");
    }, 1200);
  }

  function refreshPL(silent = false) {
    clearPanel("pl");
    state.refreshingPanels.add("pl");
    renderApp();
    window.setTimeout(() => {
      state.refreshingPanels.delete("pl");
      data.pl.value = Number((data.pl.value + 0.42).toFixed(2));
      data.pl.breakdown[1].value = Number((data.pl.breakdown[1].value + 0.31).toFixed(2));
      state.lastSync = currentTime();
      flash("pl");
      if (!silent) pushToast("info", `P&L refreshed at ${state.lastSync}`, "Settlement feed updated in place.");
    }, 700);
  }

  function simulateStaleMTM() {
    state.bookView = "positions";
    state.bookProduct = "NDF";
    state.stale.book = "MTM stale · 14 min";
    renderApp();
    pushToast("warning", "MTM feed delayed", "Showing values from 14:18.");
  }

  function simulateDocumentsError() {
    state.errors.docs = "Couldn't reach the document vault. This usually clears in a moment.";
    state.loadingPanels.delete("docs");
    state.docDrill = null;
    renderApp();
    pushToast("error", "Couldn't load Documents. Retry.", "Document vault did not respond.", "Retry", "retry-docs");
  }

  function triggerInsight() {
    const insight = {
      heat: 84,
      kpi: "71%",
      label: "credit consumption crossed 70%",
      detail: `Jarvis noticed at ${currentTime()} · check derivative headroom`,
    };
    data.nba.insights.unshift(insight);
    const id = insightId(insight);
    state.arrivedInsights.add(id);
    renderApp();
    pushToast("ai", "Jarvis noticed: credit consumption crossed 70%", "Credit utilization moved through the desk threshold.");
    window.setTimeout(() => {
      state.arrivedInsights.delete(id);
      renderApp();
    }, 900);
  }

  function openTradeTicket() {
    pushToast("success", "Trade ticket opened for Vale NDF R$ 250M", "Ticket draft created with maturity 13/05/2026.");
  }

  function runVoiceDemo() {
    state.voiceWords = [];
    startDictation();
    const words = "Carla wants to extend the maturing NDF and receive a collar grid by five".split(" ");
    words.forEach((word, index) => {
      const timer = window.setTimeout(() => {
        if (!state.listening) return;
        state.voiceWords.push(word);
        updateComposerPanel(true);
      }, 250 + index * 260);
      state.dictationTimers.push(timer);
    });
    const stopTimer = window.setTimeout(() => {
      if (!state.listening) return;
      stopDictation(false);
      state.voiceWords = [];
      state.composerHtml = `<h3>Suggested note · ${currentTime()}</h3><p>Carla wants to extend the <strong>USD 250M NDF maturing 13/05</strong> and receive a collar restructuring grid by 17:00 BRT.</p><p><strong>Next step:</strong> open roll ticket draft and attach peer pricing. <span class="jv-htag">#voice-note</span></p>`;
      state.hasDictated = true;
      updateComposerPanel(true);
      pushToast("ai", "Voice note drafted", "Review before saving to team notes.");
    }, 6000);
    state.dictationTimers.push(stopTimer);
  }

  function disconnectFeeds() {
    state.connection = "offline";
    ["pl", "book", "docs", "hr", "insights", "coverage", "relationship"].forEach((panel) => {
      state.stale[panel] = "Cached data";
    });
    renderApp();
    pushToast("warning", "Offline — showing cached data", "Feed connection lost.");
  }

  function reconnectFeeds() {
    state.connection = "reconnecting";
    ["pl", "book", "docs", "hr", "insights"].forEach((panel) => state.refreshingPanels.add(panel));
    renderApp();
    window.setTimeout(() => {
      state.connection = "live";
      state.stale = {};
      state.refreshingPanels.clear();
      state.lastSync = currentTime();
      renderApp();
      ["pl", "book", "docs", "hr", "insights"].forEach((panel, index) => window.setTimeout(() => flash(panel, 500), index * 90));
      pushToast("success", "Feeds reconnected", `Recovered at ${state.lastSync}.`);
    }, 1400);
  }

  function retryPanel(panel) {
    state.loadingPanels.add(panel);
    delete state.errors[panel];
    renderApp();
    window.setTimeout(() => {
      clearPanel(panel);
      state.lastSync = currentTime();
      flash(panel);
      pushToast("success", `${panel === "docs" ? "Documents" : "Panel"} recovered`, "Latest data loaded.");
    }, 900);
  }

  function clearClient() {
    state.clientSelected = false;
    state.searchOpen = true;
    state.searchQuery = "";
    renderWithFocus('[data-input="search"]');
  }

  function copyText(value, context = "Copied") {
    const done = () => pushToast("success", context, value);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(value).then(done).catch(done);
    } else {
      done();
    }
  }

  function deleteNote(key) {
    const found = findNote(key);
    if (!found) return;
    const collection = data.notes[found.scope];
    const index = collection.findIndex((note) => note.id === found.note.id);
    if (index < 0) return;
    const [removed] = collection.splice(index, 1);
    state.deletedNoteUndo = { scope: found.scope, note: removed, index };
    state.pendingConfirm = null;
    renderApp();
    pushToast("warning", "Note deleted.", "Undo available for 6 seconds.", "Undo", "undo-note");
    window.setTimeout(() => {
      state.deletedNoteUndo = null;
    }, 6000);
  }

  function undoDeletedNote() {
    if (!state.deletedNoteUndo) return;
    const { scope, note, index } = state.deletedNoteUndo;
    data.notes[scope].splice(index, 0, note);
    state.deletedNoteUndo = null;
    renderApp();
    pushToast("success", "Note restored", "The note is back in the stream.");
  }

  function runInitialDemo() {
    renderApp();
    window.setTimeout(() => {
      ["relationship", "coverage", "pl", "notes", "hr", "docs", "book", "insights"].forEach(clearPanel);
      state.lastSync = currentTime();
      renderApp();
    }, 1200);
  }

  function bindRenderedEvents() {
    return;
  }

  function syncDynamicControls() {
    const askStream = root.querySelector('[data-region="ask-stream"]');
    if (askStream) {
      askStream.scrollTop = askStream.scrollHeight;
    }
    const askInput = root.querySelector('[data-input="ask"]');
    if (askInput) {
      askInput.style.height = "auto";
      askInput.style.height = `${Math.min(116, askInput.scrollHeight)}px`;
    }

    const composerEditor = root.querySelector('[data-editor="composer"]');
    if (composerEditor) {
      composerEditor.dataset.empty = cleanText(composerEditor.innerHTML) ? "false" : "true";
    }
  }

  function renderWithFocus(selector) {
    renderApp();
    if (!selector) return;
    const element = root.querySelector(selector);
    if (!element) return;
    element.focus();
    if ("selectionStart" in element) {
      const length = element.value.length;
      element.setSelectionRange(length, length);
    } else {
      placeCaretAtEnd(element);
    }
  }

  function updateAskPanel(focus = true) {
    const askWrap = root.querySelector(".jv-ask-wrap");
    if (!askWrap) {
      renderWithFocus(focus ? '[data-input="ask"]' : "");
      return;
    }
    askWrap.innerHTML = renderAskJarvis();
    syncDynamicControls();
    if (!focus) return;
    const input = root.querySelector('[data-input="ask"]');
    if (input) {
      input.focus();
      input.selectionStart = input.value.length;
      input.selectionEnd = input.value.length;
    }
  }

  function updateComposerPanel(focus = true) {
    const composer = root.querySelector(".jv-merged-composer");
    if (!composer) {
      renderWithFocus(focus ? '[data-editor="composer"]' : "");
      return;
    }
    composer.outerHTML = renderComposer();
    syncDynamicControls();
    if (!focus) return;
    const editor = root.querySelector('[data-editor="composer"]');
    if (editor) {
      editor.focus();
      placeCaretAtEnd(editor);
    }
  }

  function placeCaretAtEnd(element) {
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function updateComposerControls() {
    const editor = root.querySelector('[data-editor="composer"]');
    const saveButton = root.querySelector('[data-action="save-composer"]');
    const clearButton = root.querySelector('[data-action="clear-composer"]');
    const hasContent = Boolean(editor && cleanText(editor.innerHTML));
    if (editor) editor.dataset.empty = hasContent ? "false" : "true";
    if (saveButton) saveButton.disabled = !hasContent;
    if (clearButton) clearButton.hidden = !hasContent;
  }

  function updateComposerStatus() {
    const status = root.querySelector('[data-region="composer-status"]');
    if (status) status.innerHTML = renderComposerStatus();
  }

  function getTagSuggestEl() {
    let el = root.querySelector(".jv-tag-suggest");
    if (!el) {
      el = document.createElement("button");
      el.className = "jv-tag-suggest";
      el.type = "button";
      el.hidden = true;
      el.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const editor = root.querySelector('[data-editor="composer"]');
        if (editor) commitTagFromSuggest(editor);
      });
      el.addEventListener("touchend", (e) => {
        e.preventDefault();
        const editor = root.querySelector('[data-editor="composer"]');
        if (editor) commitTagFromSuggest(editor);
      });
      root.appendChild(el);
    }
    return el;
  }

  let _tagSuggestLocked = false;

  function showTagSuggest(word, editor) {
    if (_tagSuggestLocked) return;
    const el = getTagSuggestEl();
    el.textContent = word;
    el.hidden = false;
    try {
      const sel = window.getSelection();
      if (sel && sel.rangeCount) {
        const r = sel.getRangeAt(0).cloneRange();
        r.collapse(true);
        const rect = r.getBoundingClientRect();
        if (rect.top || rect.left) {
          el.style.position = "fixed";
          el.style.top = `${rect.bottom + 6}px`;
          el.style.left = `${Math.max(8, rect.left)}px`;
          return;
        }
      }
    } catch (_) {}
    const editorRect = editor.getBoundingClientRect();
    el.style.position = "fixed";
    el.style.top = `${editorRect.bottom + 6}px`;
    el.style.left = `${editorRect.left + 8}px`;
  }

  function hideTagSuggest() {
    const el = root.querySelector(".jv-tag-suggest");
    if (el) el.hidden = true;
  }

  function commitTagFromSuggest(editor) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) { hideTagSuggest(); return; }
    const range = sel.getRangeAt(0);
    if (!editor.contains(range.startContainer)) { hideTagSuggest(); return; }
    const node = range.startContainer;
    if (node.nodeType !== Node.TEXT_NODE) { hideTagSuggest(); return; }
    const text = node.textContent.slice(0, range.startOffset);
    const match = text.match(/(^|[\s])(#[A-Za-z0-9_-]+)$/);
    if (!match) { hideTagSuggest(); return; }
    const word = match[2];
    const startOffset = text.lastIndexOf(word);
    const before = node.textContent.slice(0, startOffset);
    const after = node.textContent.slice(startOffset + word.length);
    const span = document.createElement("span");
    span.className = "jv-htag";
    span.textContent = word;
    const space = document.createTextNode(" ");
    const parent = node.parentNode;
    if (before) parent.insertBefore(document.createTextNode(before), node);
    parent.insertBefore(span, node);
    parent.insertBefore(space, node);
    if (after) parent.insertBefore(document.createTextNode(after), node);
    parent.removeChild(node);
    const newRange = document.createRange();
    newRange.setStart(space, 1);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
    state.composerHtml = editor.innerHTML;
    _tagSuggestLocked = true;
    hideTagSuggest();
    setTimeout(() => { _tagSuggestLocked = false; }, 500);
    updateComposerControls();
  }

  function insertHashtag(tagValue) {
    const editor = root.querySelector('[data-editor="composer"]');
    if (!editor) return;
    const tag = String(tagValue || "").replace(/^#/, "").replace(/[^A-Za-z0-9_-]/g, "");
    if (!tag) return;
    editor.focus();
    document.execCommand("insertHTML", false, `<span class="jv-htag">#${escapeHtml(tag)}</span>&nbsp;`);
    state.composerHtml = editor.innerHTML;
    updateComposerControls();
  }

  function runEditorCommand(command, value, editorSelector) {
    const editor = root.querySelector(editorSelector);
    if (!editor) return;
    editor.focus();
    document.execCommand(command, false, value || null);
    if (editorSelector.includes("composer")) {
      state.composerHtml = editor.innerHTML;
      updateComposerControls();
    } else {
      state.focusHtml = editor.innerHTML;
    }
  }

  function askJarvis(question) {
    const text = (question || state.askDraft).trim();
    if (!text) return;
    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    state.chat.push({ who: "You", ts: timestamp, text });
    state.askDraft = "";
    state.thinking = true;
    updateAskPanel(true);

    if (state.askTimer) clearTimeout(state.askTimer);
    state.askTimer = setTimeout(() => {
      state.thinking = false;
      state.chat.push({
        who: "Jarvis",
        ts: timestamp,
        text: "Pulling from CRM, P&L feed and recent voice notes — give me a moment to draft a clean answer.",
      });
      updateAskPanel(true);
    }, 2800);
  }

  function clearDictationTimers() {
    state.dictationTimers.forEach((timer) => clearTimeout(timer));
    state.dictationTimers = [];
  }

  function startDictation() {
    clearDictationTimers();
    state.listening = true;
    state.draftStep = 0;
    const stamp = currentTimestamp();
    const steps = [
      "<p><em>Carla on the call — opens with iron ore Q2 inflows trending higher than budget...</em></p>",
      `<h3>Vale call · ${stamp}</h3><p>Carla M. (Treasurer) on the line.</p><p><strong>Topic 1.</strong> Wants to <strong>extend the USD 250M NDF maturing 13/05</strong> before it rolls off. Suggested 90-day tenor.</p>`,
      `<h3>Vale call · ${stamp}</h3><p>Carla M. (Treasurer) on the line.</p><p><strong>Topic 1.</strong> Wants to <strong>extend the USD 250M NDF maturing 13/05</strong> before it rolls off. Suggested 90-day tenor.</p><p><strong>Topic 2.</strong> Asked about <strong>collar restructuring</strong> — wants peer-pricing reference and indicative levels by EOD.</p><p><strong>Next step:</strong> send roll ticket draft + collar grid by 17:00 BRT. <span class="jv-htag">#hedge-discussion</span> <span class="jv-htag">#vale</span></p>`,
    ];

    steps.forEach((html, index) => {
      const delay = index === 0 ? 600 : index * 1500;
      const timer = setTimeout(() => {
        if (!state.listening) return;
        state.composerHtml = html;
        state.hasDictated = true;
        state.draftStep = index + 1;
        updateComposerPanel(true);
      }, delay);
      state.dictationTimers.push(timer);
    });
    updateComposerPanel(true);
  }

  function stopDictation(shouldRender = true) {
    clearDictationTimers();
    state.listening = false;
    state.draftStep = 0;
    if (shouldRender) updateComposerPanel(true);
  }

  root.addEventListener("click", (event) => {
    if (event.target.classList.contains("jv-modal-scrim")) {
      closeModal();
      return;
    }

    const actionTarget = event.target.closest("[data-action]");
    if (!actionTarget) return;

    const action = actionTarget.dataset.action;
    if (action === "toggle-coverage") {
      const nextOpen = !state.coverageOpen;
      closeTopPopovers();
      state.coverageOpen = nextOpen;
      renderApp();
    } else if (action === "focus-search") {
      state.searchOpen = true;
      renderWithFocus('[data-input="search"]');
    } else if (action === "toggle-pl") {
      const nextOpen = !state.plOpen;
      closeTopPopovers();
      state.plOpen = nextOpen;
      renderApp();
    } else if (action === "copy-pl") {
      event.preventDefault();
      event.stopPropagation();
      copyText(`R$ ${formatNumber(data.pl.value)}m`, "Copied P&L value");
    } else if (action === "copy-value") {
      copyText(actionTarget.dataset.value || actionTarget.textContent.trim(), "Copied value");
    } else if (action === "toggle-insights") {
      state.insightsOpen = !state.insightsOpen;
      renderApp();
    } else if (action === "close-insights") {
      state.insightsOpen = false;
      state.jarvisFullscreen = false;
      renderApp();
    } else if (action === "toggle-jarvis-fullscreen") {
      state.jarvisFullscreen = !state.jarvisFullscreen;
      renderApp();
    } else if (action === "toggle-jarvis-signals") {
      state.jarvisSignalsCollapsed = !state.jarvisSignalsCollapsed;
      renderApp();
    } else if (action === "toggle-docs") {
      const nextOpen = !state.docsOpen;
      closeTopPopovers();
      state.docsOpen = nextOpen;
      renderApp();
    } else if (action === "toggle-credit") {
      const nextOpen = !state.creditOpen;
      closeTopPopovers();
      state.creditOpen = nextOpen;
      renderApp();
    } else if (action === "toggle-hr") {
      const nextOpen = !state.hrOpen;
      closeTopPopovers();
      state.hrOpen = nextOpen;
      renderApp();
    } else if (action === "credit-page") {
      state.creditPage = Math.max(0, state.creditPage + Number(actionTarget.dataset.dir || 0));
      renderApp();
    } else if (action === "docs-tab") {
      state.docsTab = actionTarget.dataset.value === "fx" ? "fx" : "cgd";
      renderApp();
    } else if (action === "select-client") {
      reloadVale();
    } else if (action === "search-retry") {
      state.searchMode = "loading";
      renderApp();
      window.setTimeout(() => {
        state.searchMode = "idle";
        renderWithFocus('[data-input="search"]');
      }, 650);
    } else if (action === "toggle-user-menu") {
      state.userMenuOpen = !state.userMenuOpen;
      renderApp();
    } else if (action === "toggle-customize") {
      state.customizeMode = !state.customizeMode;
      renderApp();
      if (state.customizeMode) pushToast("info", "Customize mode enabled", "Use ↑/↓ controls on each panel. Press Esc to exit.");
    } else if (action === "custom-move") {
      const cardId = actionTarget.dataset.cardId;
      const direction = Number(actionTarget.dataset.dir);
      const from = state.panelOrder.indexOf(cardId);
      const to = from + direction;
      if (from >= 0 && to >= 0 && to < state.panelOrder.length) {
        const [panel] = state.panelOrder.splice(from, 1);
        state.panelOrder.splice(to, 0, panel);
        renderApp();
      }
    } else if (action === "toggle-card") {
      const cardId = actionTarget.dataset.cardId;
      state.cardOpen[cardId] = state.cardOpen[cardId] === false;
      renderApp();
    } else if (action === "notes-tab") {
      state.notesTab = actionTarget.dataset.value;
      renderApp();
    } else if (action === "composer-scope") {
      state.composerScope = actionTarget.dataset.value;
      renderWithFocus('[data-editor="composer"]');
    } else if (action === "editor-command") {
      event.preventDefault();
      runEditorCommand(actionTarget.dataset.command, actionTarget.dataset.value, '[data-editor="composer"]');
    } else if (action === "insert-hashtag") {
      event.preventDefault();
      insertHashtag(actionTarget.dataset.tag);
    } else if (action === "normalize-hashtags") {
      event.preventDefault();
      const editor = root.querySelector('[data-editor="composer"]');
      const currentHtml = editor ? editor.innerHTML : state.composerHtml;
      const nextHtml = decorateHashtags(currentHtml);
      if (nextHtml === currentHtml) return;
      state.composerHtml = nextHtml;
      renderWithFocus('[data-editor="composer"]');
    } else if (action === "clear-composer") {
      state.composerHtml = "";
      state.hasDictated = false;
      state.listening = false;
      state.voiceWords = [];
      state.savingStatus = "";
      if (state.savingTimer) clearTimeout(state.savingTimer);
      clearDictationTimers();
      renderWithFocus('[data-editor="composer"]');
    } else if (action === "toggle-dictation") {
      state.listening ? stopDictation() : startDictation();
    } else if (action === "save-composer") {
      saveComposerNote();
    } else if (action === "toggle-note-fold") {
      const key = actionTarget.dataset.noteKey;
      state.expandedNotes.has(key) ? state.expandedNotes.delete(key) : state.expandedNotes.add(key);
      renderApp();
    } else if (action === "open-note") {
      const key = actionTarget.dataset.noteKey;
      const found = findNote(key);
      if (!found) return;
      state.focusNoteKey = key;
      state.focusEdit = false;
      state.focusHtml = found.note.body;
      renderApp();
    } else if (action === "delete-note") {
      state.pendingConfirm = `delete-note:${actionTarget.dataset.noteKey}`;
      renderApp();
    } else if (action === "confirm-delete-note") {
      deleteNote(actionTarget.dataset.noteKey);
    } else if (action === "cancel-confirm") {
      state.pendingConfirm = null;
      renderApp();
    } else if (action === "close-modal") {
      closeModal();
    } else if (action === "modal-edit") {
      state.focusEdit = true;
      renderWithFocus('[data-editor="modal"]');
    } else if (action === "modal-cancel") {
      const found = findNote(state.focusNoteKey);
      state.focusHtml = found ? found.note.body : "";
      state.focusEdit = false;
      renderApp();
    } else if (action === "modal-save") {
      saveFocusedNote();
    } else if (action === "modal-editor-command") {
      event.preventDefault();
      runEditorCommand(actionTarget.dataset.command, actionTarget.dataset.value, '[data-editor="modal"]');
    } else if (action === "doc-drill") {
      state.docDrill = actionTarget.dataset.value;
      renderApp();
    } else if (action === "doc-back") {
      state.docDrill = null;
      renderApp();
    } else if (action === "book-view") {
      state.bookView = actionTarget.dataset.value;
      state.memberFilter = "all";
      renderApp();
    } else if (action === "book-product") {
      state.bookProduct = actionTarget.dataset.value;
      state.memberFilter = "all";
      renderApp();
    } else if (action === "ask-suggested") {
      askJarvis(actionTarget.dataset.query);
    } else if (action === "send-ask") {
      askJarvis();
    } else if (action === "like-insight") {
      const id = actionTarget.dataset.insightId;
      state.insightFeedback[id] = { vote: "like", at: currentTime() };
      state.actedInsights.add(id);
      state.insightDislikeTarget = null;
      state.insightDislikeDraft = "";
      state.insightFeedbackError = "";
      renderApp();
      pushToast("success", "Signal feedback saved", "Marked useful and dismissed.");
    } else if (action === "dislike-insight") {
      const id = actionTarget.dataset.insightId;
      delete state.insightFeedback[id];
      state.insightDislikeTarget = id;
      state.insightDislikeDraft = "";
      state.insightFeedbackError = "";
      renderWithFocus('[data-input="insight-dislike"]');
    } else if (action === "cancel-insight-dislike") {
      state.insightDislikeTarget = null;
      state.insightDislikeDraft = "";
      state.insightFeedbackError = "";
      renderApp();
    } else if (action === "submit-insight-dislike") {
      const reason = state.insightDislikeDraft.trim();
      if (!reason) {
        state.insightFeedbackError = "Type a reason before sending.";
        renderWithFocus('[data-input="insight-dislike"]');
        return;
      }
      state.insightFeedback[state.insightDislikeTarget] = { vote: "dislike", reason, at: currentTime() };
      state.actedInsights.add(state.insightDislikeTarget);
      state.insightDislikeTarget = null;
      state.insightDislikeDraft = "";
      state.insightFeedbackError = "";
      renderApp();
      pushToast("info", "Signal feedback saved", "Marked not useful and dismissed.");
    } else if (action === "retry-panel") {
      retryPanel(actionTarget.dataset.panel);
    } else if (action === "dismiss-toast") {
      dismissToast(actionTarget.dataset.toastId);
    } else if (action === "toast-action") {
      const toast = state.toasts.find((item) => item.id === actionTarget.dataset.toastId);
      if (toast?.action === "retry-docs") retryPanel("docs");
      if (toast?.action === "undo-note") undoDeletedNote();
      dismissToast(actionTarget.dataset.toastId);
    } else if (action === "toggle-dev") {
      state.devOpen = !state.devOpen;
      renderApp();
    } else if (action === "demo-reload") {
      reloadVale();
    } else if (action === "demo-refresh-pl") {
      refreshPL();
    } else if (action === "demo-stale-mtm") {
      simulateStaleMTM();
    } else if (action === "demo-doc-error") {
      simulateDocumentsError();
    } else if (action === "demo-insight") {
      triggerInsight();
    } else if (action === "demo-ticket") {
      openTradeTicket();
    } else if (action === "demo-voice") {
      runVoiceDemo();
    } else if (action === "demo-disconnect") {
      disconnectFeeds();
    } else if (action === "demo-reconnect") {
      reconnectFeeds();
    } else if (action === "demo-clear-client") {
      clearClient();
    }
  });

  root.addEventListener("input", (event) => {
    const inputType = event.target.dataset.input;
    const editorType = event.target.dataset.editor;

    if (inputType === "search") {
      state.searchQuery = event.target.value;
      state.searchOpen = true;
      state.searchMode = "loading";
      if (state.searchTimer) clearTimeout(state.searchTimer);
      state.searchTimer = window.setTimeout(() => {
        state.searchMode = state.searchQuery.trim().toLowerCase() === "error" ? "error" : "idle";
        renderWithFocus('[data-input="search"]');
      }, 280);
      renderWithFocus('[data-input="search"]');
    } else if (inputType === "ask") {
      state.askDraft = event.target.value;
      event.target.style.height = "auto";
      event.target.style.height = `${Math.min(116, event.target.scrollHeight)}px`;
      const sendButton = root.querySelector('[data-action="send-ask"]');
      if (sendButton) sendButton.disabled = !state.askDraft.trim();
    } else if (inputType === "credit-filter") {
      state.creditFilter = event.target.value;
      state.creditPage = 0;
      renderWithFocus('[data-input="credit-filter"]');
    } else if (inputType === "insight-dislike") {
      state.insightDislikeDraft = event.target.value;
      state.insightFeedbackError = "";
      const sendButton = root.querySelector('[data-action="submit-insight-dislike"]');
      if (sendButton) sendButton.disabled = !state.insightDislikeDraft.trim();
    } else if (editorType === "composer") {
      state.composerHtml = event.target.innerHTML;
      state.savingStatus = "saving…";
      updateComposerControls();
      updateComposerStatus();
      if (state.savingTimer) clearTimeout(state.savingTimer);
      state.savingTimer = window.setTimeout(() => {
        state.savingStatus = `saved ${currentTime()}`;
        updateComposerStatus();
      }, 700);
    } else if (editorType === "modal") {
      state.focusHtml = event.target.innerHTML;
      event.target.dataset.empty = cleanText(event.target.innerHTML) ? "false" : "true";
    }
  });

  root.addEventListener("focusin", (event) => {
    if (event.target.dataset.input === "search" && !state.searchOpen) {
      state.searchOpen = true;
      renderWithFocus('[data-input="search"]');
    }
  });

  root.addEventListener("change", (event) => {
    if (event.target.dataset.input === "member-filter") {
      state.memberFilter = event.target.value;
      renderApp();
    } else if (event.target.dataset.input === "docs-counterparty") {
      state.docsCounterparty = event.target.value;
      renderApp();
    } else if (event.target.dataset.input === "reduce-motion") {
      state.reduceMotion = event.target.checked;
      localStorage.setItem("jvReduceMotion", state.reduceMotion ? "1" : "0");
      renderApp();
    }
  });

  root.addEventListener("keydown", (event) => {
    if (event.target.dataset.editor === "composer" && (event.key === "Enter" || event.key === " " || event.key === "Escape")) {
      hideTagSuggest();
    }
    if (event.target.dataset.editor === "composer" && event.key === "Tab") {
      event.preventDefault();
      const suggestEl = root.querySelector(".jv-tag-suggest");
      if (suggestEl && !suggestEl.hidden) {
        commitTagFromSuggest(event.target);
      } else {
        runEditorCommand("insertHTML", "&nbsp;&nbsp;", '[data-editor="composer"]');
      }
      return;
    }
    if (event.target.dataset.editor === "modal" && event.key === "Tab") {
      event.preventDefault();
      runEditorCommand("insertHTML", "&nbsp;&nbsp;", '[data-editor="modal"]');
      return;
    }
    if (event.target.dataset.input === "ask" && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      state.askDraft = event.target.value;
      askJarvis();
    }
  });

  function checkTagSuggest() {
    if (_tagSuggestLocked) return;
    const editor = root.querySelector('[data-editor="composer"]');
    if (!editor) { hideTagSuggest(); return; }
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) { hideTagSuggest(); return; }
    const range = sel.getRangeAt(0);
    if (!editor.contains(range.startContainer)) { hideTagSuggest(); return; }
    const node = range.startContainer;
    if (node.nodeType !== Node.TEXT_NODE) { hideTagSuggest(); return; }
    const text = node.textContent.slice(0, range.startOffset);
    const match = text.match(/(^|[\s])(#[A-Za-z0-9_-]+)$/);
    if (match && match[2].length > 1) {
      showTagSuggest(match[2], editor);
    } else {
      hideTagSuggest();
    }
  }

  document.addEventListener("selectionchange", checkTagSuggest);

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      state.searchOpen = true;
      renderWithFocus('[data-input="search"]');
    } else if (event.shiftKey && event.key.toLowerCase() === "d") {
      event.preventDefault();
      state.devOpen = !state.devOpen;
      renderApp();
    } else if (event.key === "Escape") {
      if (state.focusNoteKey) {
        closeModal();
      } else if (state.customizeMode) {
        state.customizeMode = false;
        renderApp();
      } else if (state.insightsOpen) {
        state.insightsOpen = false;
        state.jarvisFullscreen = false;
        renderApp();
      } else {
        state.searchOpen = false;
        closeTopPopovers();
        renderApp();
      }
    }
  });

  document.addEventListener("mousedown", (event) => {
    if (root.contains(event.target)) {
      const insideSearch = event.target.closest(".jv-search-wrap");
      const insideCoverage = event.target.closest(".jv-cov-wrap");
      const insidePL = event.target.closest(".jv-pl-chip-wrap");
      const insideKpi = event.target.closest(".jv-kpi-wrap");
      const insideJarvis = event.target.closest(".jv-insights-drawer") || event.target.closest(".jv-jarvis-fab");
      const insideMenu = event.target.closest(".jv-top-actions");
      const insideDev = event.target.closest(".jv-dev");
      if (insideSearch || insideCoverage || insidePL || insideKpi || insideJarvis || insideMenu || insideDev) return;
    }
    if (state.searchOpen || state.coverageOpen || state.plOpen || state.docsOpen || state.creditOpen || state.hrOpen || state.userMenuOpen) {
      state.searchOpen = false;
      closeTopPopovers();
      state.userMenuOpen = false;
      renderApp();
    }
  });

  function saveComposerNote() {
    const editor = root.querySelector('[data-editor="composer"]');
    const html = editor ? editor.innerHTML : state.composerHtml;
    if (!cleanText(html)) return;
    const body = decorateHashtags(html);

    const target = data.notes[state.composerScope];
    target.unshift({
      id: `local-${Date.now()}`,
      author: "You",
      ts: currentTimestamp(),
      body,
    });

    state.notesTab = state.composerScope;
    state.composerHtml = "";
    state.hasDictated = false;
    state.listening = false;
    state.savingStatus = "";
    if (state.savingTimer) clearTimeout(state.savingTimer);
    clearDictationTimers();
    pushToast("success", "Note saved", `${state.composerScope === "personal" ? "Personal" : "Team"} note saved at ${currentTime()}`);
    renderApp();
  }

  function saveFocusedNote() {
    const found = findNote(state.focusNoteKey);
    if (!found) return;
    const editor = root.querySelector('[data-editor="modal"]');
    found.note.body = editor ? editor.innerHTML : state.focusHtml;
    state.focusHtml = found.note.body;
    state.focusEdit = false;
    renderApp();
  }

  function closeModal() {
    state.focusNoteKey = null;
    state.focusEdit = false;
    state.focusHtml = "";
    renderApp();
  }

  runInitialDemo();
})();
