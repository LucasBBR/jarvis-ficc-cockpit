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
    insightsOpen: false,
    cardOpen: { notes: true, docs: true, hr: true, book: true },
    notesTab: "team",
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

  function cleanText(html) {
    const holder = document.createElement("div");
    holder.innerHTML = html || "";
    return holder.textContent.trim();
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
      <div class="jv-app">
        ${renderTopBar()}
        <main class="jv-main">
          <div class="jv-grid">
            <div class="jv-col jv-col-a">
              ${renderNotesCard()}
              ${renderHitRatioCard()}
            </div>
            <div class="jv-col jv-col-b">
              ${renderDocumentsCard()}
              ${renderBookCard()}
            </div>
          </div>
        </main>
        ${renderInsightsPanel()}
        ${state.focusNoteKey ? renderFocusModal() : ""}
      </div>
    `;
    bindRenderedEvents();
    syncDynamicControls();
  }

  function renderTopBar() {
    return `
      <div class="jv-topbar">
        <div class="jv-brand">
          <div class="jv-jarvis-logo" title="Jarvis">
            ${jarvisLogo("idle", 28)}
          </div>
          <div class="jv-brand-name">Jarvis<span class="light">/ FICC</span></div>
        </div>
        <div class="jv-search-wrap">
          <div class="jv-search">
            ${icon("search")}
            <input data-input="search" type="text" placeholder="Search economic group..." value="${escapeHtml(state.searchQuery)}" />
            <span class="jv-kbd">⌘K</span>
          </div>
          ${state.searchOpen ? renderSearchDropdown() : ""}
        </div>
      </div>
      <div class="jv-client-banner">
        <div class="left"><span class="name">${escapeHtml(data.client.group)}</span></div>
        <div class="banner-right">
          ${renderCoverageChip()}
          ${renderPLChip()}
        </div>
      </div>
    `;
  }

  function renderSearchDropdown() {
    const query = state.searchQuery.toLowerCase();
    const results = query
      ? data.searchResults.filter((result) => result.name.toLowerCase().includes(query))
      : data.searchResults;
    const rows = results.map((result, index) => `
      <div class="jv-search-row ${index === 0 ? "kbd" : ""} ${result.id === "vale" ? "active" : ""}" data-action="select-client" data-id="${escapeHtml(result.id)}">
        <div>
          <div class="name">${escapeHtml(result.name)}</div>
          <div class="meta">${escapeHtml(result.sector)} · Coverage ${escapeHtml(result.coverage)}</div>
        </div>
        ${result.id === "vale" ? '<span class="now-tag">current</span>' : ""}
        ${icon("arrowR", 14)}
      </div>
    `).join("");
    return `
      <div class="jv-search-dropdown">
        <div class="jv-search-section">${query ? "Matches" : "Economic groups"}</div>
        ${rows || '<div class="jv-search-row"><div><div class="name">No matches</div><div class="meta">Try Vale, Petrobras, or Suzano</div></div></div>'}
      </div>
    `;
  }

  function renderCoverageChip() {
    const team = data.client.coverageTeam;
    const primary = team.find((member) => member.primary) || team[0];
    return `
      <div class="jv-cov-wrap" data-hover="coverage">
        <button class="jv-cov-chip ${state.coverageOpen ? "open" : ""}" data-action="toggle-coverage">
          ${icon("user", 13)}
          <span class="lab">Coverage</span>
          <span class="primary">${escapeHtml(primary.name.split(" ").pop())}</span>
          <span class="cnt">+${team.length - 1}</span>
          ${icon("chevD", 11)}
        </button>
        ${state.coverageOpen ? `
          <div class="jv-cov-pop">
            <div class="jv-cov-pop-head">
              <div class="t">Coverage team</div>
              <div class="s">${team.length} officers across BTG · Vale economic group</div>
            </div>
            <ul class="jv-cov-list">
              ${team.map((member) => `
                <li class="${member.primary ? "primary" : ""}">
                  <span class="av">${escapeHtml(member.name.split(" ").pop().slice(0, 2).toUpperCase())}</span>
                  <div class="meta">
                    <div class="name">${escapeHtml(member.name)}${member.primary ? '<span class="badge">Mesa lead</span>' : ""}</div>
                    <div class="area">${escapeHtml(member.area)}</div>
                  </div>
                </li>
              `).join("")}
            </ul>
          </div>
        ` : ""}
      </div>
    `;
  }

  function renderPLChip() {
    const directionClass = data.pl.deltaPct >= 0 ? "pos" : "neg";
    return `
      <div class="jv-pl-chip-wrap" data-hover="pl">
        <button class="jv-pl-chip ${state.plOpen ? "open" : ""}" data-action="toggle-pl">
          <span class="k">P&amp;L · ${escapeHtml(data.pl.period)}</span>
          <span class="v">R$ ${formatNumber(data.pl.value)}<span class="u">m</span></span>
          <span class="d ${directionClass}">
            ${icon(data.pl.deltaPct >= 0 ? "arrowUp" : "arrowDn", 10)}
            ${data.pl.deltaPct > 0 ? "+" : ""}${data.pl.deltaPct}%
          </span>
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
        <div class="jv-pl-pop-head">
          <div>
            <div class="t">P&amp;L breakdown</div>
            <div class="s">${escapeHtml(data.pl.period)} vs same window prior year</div>
          </div>
          <div class="hero">
            <div class="big">R$ ${formatNumber(data.pl.value)}<small>m</small></div>
            <div class="prior">vs R$ ${formatNumber(data.pl.prior)}m prior</div>
          </div>
        </div>
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
                  <td class="num">${formatNumber(breakdown.value)}</td>
                  <td class="num prior">${formatNumber(breakdown.prior)}</td>
                  <td class="num ${positive ? "pos" : "neg"}">${positive ? "+" : ""}${breakdown.deltaPct.toFixed(1)}%</td>
                  <td class="bar"><i style="width: ${(breakdown.value / maxValue) * 100}%"></i></td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
        <div class="jv-pl-pop-foot">Source · BTG FICC settlement feed · refreshed 09:42 BRT</div>
      </div>
    `;
  }

  function renderInsightsPanel() {
    const hotSignal = data.nba.insights.reduce((max, signal) => signal.heat > max.heat ? signal : max, data.nba.insights[0]);
    return `
      <button class="jv-insights-toggle ${state.insightsOpen ? "open" : ""}" data-action="toggle-insights" aria-expanded="${state.insightsOpen}">
        ${jarvisLogo(state.thinking ? "thinking" : "idle", 28)}
        <span class="copy">
          <span class="k">Signals</span>
          <span class="v">${escapeHtml(hotSignal.kpi)}</span>
        </span>
      </button>
      ${state.insightsOpen ? `
        <div class="jv-insights-backdrop" data-action="close-insights"></div>
        <aside class="jv-insights-drawer" aria-label="Jarvis market signals">
          <header class="jv-insights-head">
            ${jarvisLogo(state.thinking ? "thinking" : "idle", 42)}
            <div>
              <div class="eyebrow">Jarvis Signals</div>
              <div class="summary">${data.nba.insights.length} live signals · updated 2 min ago</div>
            </div>
            <button class="jv-icon-mini" data-action="close-insights" title="Collapse signals">${icon("close", 16)}</button>
          </header>
          <div class="jv-signal-grid">
            ${data.nba.insights.map(renderInsight).join("")}
          </div>
          <div class="jv-ask-wrap">
            ${renderAskJarvis()}
          </div>
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

  function renderInsight(insight) {
    const heatColor = insight.heat >= 82 ? "var(--blue-60)" : insight.heat >= 58 ? "var(--blue-40)" : insight.heat >= 32 ? "#8aa4cf" : "var(--gray-50)";
    const heatBg = insight.heat >= 82 ? "rgba(0,87,217,.10)" : insight.heat >= 58 ? "rgba(111,160,255,.12)" : insight.heat >= 32 ? "rgba(138,164,207,.12)" : "rgba(140,146,163,.10)";
    return `
      <div class="jv-insight jv-signal-card" style="--heat-color:${heatColor};--heat-bg:${heatBg};--heat:${insight.heat}%">
        <div class="kpi">${escapeHtml(insight.kpi)}</div>
        <div class="label">${escapeHtml(insight.label)}</div>
        <div class="detail">${escapeHtml(insight.detail)}</div>
      </div>
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
            <div class="jv-ask-msg jarvis thinking">
              <div class="head"><span class="who">${jarvisLogo("thinking", 14)}Jarvis</span></div>
              <div class="text"><span class="dots"><i></i><i></i><i></i></span></div>
            </div>
          ` : ""}
        </div>
        <div class="jv-ask-suggested">
          ${data.nba.suggestedQueries.map((query) => `
            <button class="jv-ask-chip" data-action="ask-suggested" data-query="${escapeHtml(query)}">${escapeHtml(query)}</button>
          `).join("")}
        </div>
        <div class="jv-ask-input">
          ${jarvisLogo(state.thinking ? "thinking" : "idle", 18)}
          <input data-input="ask" type="text" placeholder="Ask Jarvis anything about Vale — fast feedback, no form..." value="${escapeHtml(state.askDraft)}" />
          <button class="send" data-action="send-ask" ${cleanText(state.askDraft) ? "" : "disabled"} title="Send">${icon("send", 14)}</button>
        </div>
      </div>
    `;
  }

  function renderCard(id, title, badge, actions, body, className = "") {
    const open = state.cardOpen[id] !== false;
    return `
      <section class="jv-card ${open ? "open" : "collapsed"} ${className}" data-card="${escapeHtml(id)}">
        <header class="jv-card-head">
          <button class="jv-card-toggle" data-action="toggle-card" data-card-id="${escapeHtml(id)}" title="${open ? "Collapse" : "Expand"}">${icon(open ? "chevD" : "chevR", 14)}</button>
          <h3 class="jv-card-title">${escapeHtml(title)}</h3>
          ${badge ? `<span class="jv-card-badge">${badge}</span>` : ""}
          <div class="jv-card-actions">${actions || ""}</div>
        </header>
        ${open ? `<div class="jv-card-body">${body}</div>` : ""}
      </section>
    `;
  }

  function renderNotesCard() {
    const totalNotes = data.notes.personal.length + data.notes.team.length;
    const actions = `
      <div class="jv-seg">
        ${renderSegmentButton("notes-tab", "all", `All · ${totalNotes}`, state.notesTab === "all")}
        ${renderSegmentButton("notes-tab", "team", `Team · ${data.notes.team.length}`, state.notesTab === "team")}
        ${renderSegmentButton("notes-tab", "personal", `Personal · ${data.notes.personal.length}`, state.notesTab === "personal")}
      </div>
    `;
    const body = `
      ${renderComposer()}
      <div class="jv-notes-stream">
        ${getVisibleNotes().map((entry) => renderNote(entry.note, entry.scope)).join("")}
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
              <span class="dot team"></span>Team · shared with FICC desk
            </button>
          </div>
          <div class="jv-mc-status">
            ${state.listening ? '<span class="live"><span class="livedot"></span>Jarvis listening · 0:42</span>' : state.hasDictated ? '<span class="dictated">Drafted by Jarvis · edit freely</span>' : '<span class="hint">Type # to tag</span>'}
          </div>
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
              ${state.listening ? '<span class="bars"><i></i><i></i><i></i><i></i></span>' : icon("mic", 15)}
            </button>
            <button class="jv-btn primary sm" data-action="save-composer" ${composerHasContent ? "" : "disabled"}>${icon("check", 11)} Save ${state.composerScope === "personal" ? "personal" : "team"}</button>
          </div>
        </div>
      </div>
    `;
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
      <div class="jv-hr-cell">
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
    if (kind === "active") return '<span class="jv-doc-badge ok">Active</span>';
    if (kind === "warning") return '<span class="jv-doc-badge warn">Renewal due</span>';
    if (kind === "pending") return '<span class="jv-doc-badge pend">Pending</span>';
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
          <div class="t">No ${escapeHtml(state.bookView)} for ${escapeHtml(state.bookProduct)}</div>
          <div class="s">Switch product or open a new ticket</div>
        </div>
      `;
    }

    const columns = state.bookView === "positions"
      ? ["Company", "Side", "Notional", "Strike / Rate", "Maturity", "Days", "MTM (R$ m)"]
      : ["Date", "Company", "Side", "Notional", "Rate", "Spread (bps)", "Seller"];
    return `
      <div class="jv-book-tablewrap">
        <table class="jv-table">
          <thead>
            <tr>${columns.map((column, index) => `<th class="${index > 1 && column !== "Company" ? "num" : ""}">${escapeHtml(column)}</th>`).join("")}</tr>
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
        <td class="company">${escapeHtml(row.company)}</td>
        <td><span class="pill side-${sideClass(row.side)}">${escapeHtml(row.side)}</span></td>
        <td class="num">${escapeHtml(row.notional)}</td>
        <td class="num jv-mono">${escapeHtml(row.rate)}</td>
        <td class="num jv-mono">${escapeHtml(row.maturity)}</td>
        <td class="num"><span style="font-weight:${row.days <= 7 ? 600 : 400};color:${daysColor}">${row.days}d</span></td>
        <td class="num ${mtmClass}">${row.mtm > 0 ? "+" : ""}${formatNumber(row.mtm)}</td>
      </tr>
    `;
  }

  function renderTradeRow(row) {
    return `
      <tr>
        <td class="num jv-mono">${escapeHtml(row.date)}</td>
        <td class="company">${escapeHtml(row.company)}</td>
        <td><span class="pill side-${sideClass(row.side)}">${escapeHtml(row.side)}</span></td>
        <td class="num">${escapeHtml(row.notional)}</td>
        <td class="num jv-mono">${escapeHtml(row.rate)}</td>
        <td class="num"><span class="jv-spread-bar"><i style="width: ${(row.spread / row.spreadMax) * 100}%"></i></span>${row.spread}</td>
        <td>${escapeHtml(row.seller)}</td>
      </tr>
    `;
  }

  function bindRenderedEvents() {
    const coverageWrap = root.querySelector('[data-hover="coverage"]');
    const plWrap = root.querySelector('[data-hover="pl"]');

    if (coverageWrap) {
      coverageWrap.addEventListener("mouseenter", () => {
        state.coverageOpen = true;
        renderApp();
      });
      coverageWrap.addEventListener("mouseleave", () => {
        state.coverageOpen = false;
        renderApp();
      });
    }

    if (plWrap) {
      plWrap.addEventListener("mouseenter", () => {
        state.plOpen = true;
        renderApp();
      });
      plWrap.addEventListener("mouseleave", () => {
        state.plOpen = false;
        renderApp();
      });
    }
  }

  function syncDynamicControls() {
    const askStream = root.querySelector('[data-region="ask-stream"]');
    if (askStream) {
      askStream.scrollTop = askStream.scrollHeight;
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
    renderWithFocus('[data-input="ask"]');

    if (state.askTimer) clearTimeout(state.askTimer);
    state.askTimer = setTimeout(() => {
      state.thinking = false;
      state.chat.push({
        who: "Jarvis",
        ts: timestamp,
        text: "Pulling from CRM, P&L feed and recent voice notes — give me a moment to draft a clean answer.",
      });
      renderWithFocus('[data-input="ask"]');
    }, 1200);
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
        renderWithFocus('[data-editor="composer"]');
      }, delay);
      state.dictationTimers.push(timer);
    });
    renderWithFocus('[data-editor="composer"]');
  }

  function stopDictation() {
    clearDictationTimers();
    state.listening = false;
    state.draftStep = 0;
    renderWithFocus('[data-editor="composer"]');
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
      state.coverageOpen = !state.coverageOpen;
      state.plOpen = false;
      renderApp();
    } else if (action === "toggle-pl") {
      state.plOpen = !state.plOpen;
      state.coverageOpen = false;
      renderApp();
    } else if (action === "toggle-insights") {
      state.insightsOpen = !state.insightsOpen;
      renderApp();
    } else if (action === "close-insights") {
      state.insightsOpen = false;
      renderApp();
    } else if (action === "select-client") {
      state.searchOpen = false;
      state.searchQuery = "";
      renderApp();
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
    } else if (action === "clear-composer") {
      state.composerHtml = "";
      state.hasDictated = false;
      state.listening = false;
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
    }
  });

  root.addEventListener("input", (event) => {
    const inputType = event.target.dataset.input;
    const editorType = event.target.dataset.editor;

    if (inputType === "search") {
      state.searchQuery = event.target.value;
      state.searchOpen = true;
      renderWithFocus('[data-input="search"]');
    } else if (inputType === "ask") {
      state.askDraft = event.target.value;
      const sendButton = root.querySelector('[data-action="send-ask"]');
      if (sendButton) sendButton.disabled = !state.askDraft.trim();
    } else if (editorType === "composer") {
      state.composerHtml = event.target.innerHTML;
      updateComposerControls();
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
    }
  });

  root.addEventListener("keydown", (event) => {
    if (event.target.dataset.input === "ask" && event.key === "Enter") {
      event.preventDefault();
      state.askDraft = event.target.value;
      askJarvis();
    }
  });

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      state.searchOpen = true;
      renderWithFocus('[data-input="search"]');
    } else if (event.key === "Escape") {
      if (state.focusNoteKey) {
        closeModal();
      } else if (state.insightsOpen) {
        state.insightsOpen = false;
        renderApp();
      } else {
        state.searchOpen = false;
        state.coverageOpen = false;
        state.plOpen = false;
        renderApp();
      }
    }
  });

  document.addEventListener("mousedown", (event) => {
    if (root.contains(event.target)) {
      const insideSearch = event.target.closest(".jv-search-wrap");
      const insideCoverage = event.target.closest(".jv-cov-wrap");
      const insidePL = event.target.closest(".jv-pl-chip-wrap");
      if (insideSearch || insideCoverage || insidePL) return;
    }
    if (state.searchOpen || state.coverageOpen || state.plOpen) {
      state.searchOpen = false;
      state.coverageOpen = false;
      state.plOpen = false;
      renderApp();
    }
  });

  function saveComposerNote() {
    const editor = root.querySelector('[data-editor="composer"]');
    const html = editor ? editor.innerHTML : state.composerHtml;
    if (!cleanText(html)) return;

    const target = data.notes[state.composerScope];
    target.unshift({
      id: `local-${Date.now()}`,
      author: "You",
      ts: currentTimestamp(),
      body: html,
    });

    state.notesTab = state.composerScope;
    state.composerHtml = "";
    state.hasDictated = false;
    state.listening = false;
    clearDictationTimers();
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

  renderApp();
})();
