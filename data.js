// Vale economic group — mock data for Jarvis FICC cockpit
window.JV_DATA = {
  client: {
    group: "Vale",
    coverage: "Domenes",
    relationshipSince: 2009,
    members: [
      { id: "vale-sa",  name: "Vale S.A.",                 tag: "Holding"   },
      { id: "vale-mn",  name: "Vale Manganês",             tag: "Subsidiary"},
      { id: "vale-cb",  name: "Vale Canadá Mining",        tag: "Foreign"   },
      { id: "salobo",   name: "Salobo Metais",             tag: "Subsidiary"},
      { id: "vale-fert","name": "Vale Fertilizantes",      tag: "Subsidiary"},
    ],
    coverageTeam: [
      { area: "Mesa · FX & NDF Sales",          name: "F. Domenes",     primary: true  },
      { area: "Mesa · Spot FX Trading",         name: "R. Costa"  },
      { area: "Mesa · Options & Swaps",         name: "L. Albuquerque" },
      { area: "Mesa · Fixed Income Sales",      name: "P. Mendes" },
      { area: "Investment Banking Coverage",    name: "G. Ferraiolo" },
      { area: "Credit Risk Officer",            name: "C. Nery" },
      { area: "Equity Derivatives",             name: "M. Ribeiro" },
      { area: "Treasury & Funding",             name: "A. Tavares" },
      { area: "Research · Mining & Metals",     name: "D. Carvalho" },
    ],
  },

  nba: {
    // heat: 0 (cold/grey) ··· 100 (hot/blue). Drives the hot↔cold sidebar palette.
    insights: [
      { heat: 96, kpi: "R$ 250M", label: "NDF maturing 13/05",             detail: "4 days to roll · treasurer flagged" },
      { heat: 88, kpi: "12d",     label: "to hedge-review window close",   detail: "Carla M. note · 02/05" },
      { heat: 72, kpi: "+18%",    label: "USDBRL 30d vol vs L30D avg",     detail: "Peers extending +60d tenor" },
      { heat: 58, kpi: "−4 bps",  label: "lost USD Collar to Itaú",        detail: "Pricing matrix vs peers · 17/04" },
      { heat: 36, kpi: "0",       label: "NDFs closed YTD · 4 last year",  detail: "Q2 hedge cycle window narrowing" },
      { heat: 18, kpi: "90d",     label: "without a Spot FX quote",        detail: "Last quote · 09/02/2026" },
    ],
    suggestedQueries: [
      "What changed for Vale this week?",
      "Why is the FX hit rate down?",
      "Show peer hedge structures",
      "Open positions maturing in 30d",
    ],
    recentChat: [
      { who: "Jarvis", ts: "08:38", text: "Vale's last NDF closed 11/04 — 27d ago. Treasurer flagged hedge review on 02/05. Recommend re-engaging on collar restructuring." },
      { who: "You",    ts: "08:42", text: "What was the spread we won at last time?" },
      { who: "Jarvis", ts: "08:42", text: "9 bps over screen on 11/04 (USD 200M). Peers showed 11–14 bps that week." },
    ],
  },

  // Search shows just three exporters per spec
  searchResults: [
    { id: "vale", name: "Vale",       group: true, sector: "Mining & Metals",   coverage: "Domenes" },
    { id: "petr", name: "Petrobras",  group: true, sector: "Oil & Gas",         coverage: "Ferraiolo" },
    { id: "suzb", name: "Suzano",     group: true, sector: "Pulp & Paper",      coverage: "Albuquerque" },
  ],

  // P&L: lives in the top bar. YTD hero + product breakdown w/ prior period comparison.
  pl: {
    period: "YTD 2026",
    value: 38.61,
    prior: 35.52, // prior period (e.g. YTD 2025 same window)
    deltaPct: 8.7,
    sparkMonthly: [22, 28, 25, 31, 36, 32, 41, 38, 44, 39, 35, 38.6],
    breakdown: [
      { name: "Spot FX",      value: 9.42,  prior: 8.20, deltaPct: 14.9 },
      { name: "NDF",          value: 18.73, prior: 16.04, deltaPct: 16.8 },
      { name: "Options",      value: 4.18,  prior: 6.32, deltaPct: -33.9 },
      { name: "Swaps",        value: 3.94,  prior: 2.81, deltaPct: 40.2 },
      { name: "Fixed Income", value: 2.34,  prior: 2.15, deltaPct: 8.8 },
    ],
  },

  // Hit Ratio: just FX (Spot) and NDF + platform breakdown
  hitRatio: {
    period: "Last 90 days",
    fx:  { quoted: 41, closed: 32, pct: 78, prior: 75, deltaPp: +3 },
    ndf: { quoted: 38, closed: 27, pct: 71, prior: 65, deltaPp: +6 },
    platforms: [
      { name: "Bloomberg", quoted: 38, closed: 28, pct: 74, share: 48 },
      { name: "360T",      quoted: 24, closed: 18, pct: 75, share: 30 },
      { name: "FXAll",     quoted: 12, closed: 8,  pct: 67, share: 15 },
      { name: "Voice / RFQ", quoted: 5, closed: 5, pct: 100, share: 7 },
    ],
  },

  // Trades+Positions unified — actual company names per row
  book: {
    products: ["NDF", "Spot FX", "Options", "Swaps", "Fixed Income"],
    positions: {
      "NDF": [
        { company: "Vale S.A.",            side: "Short", notional: "USD 250m",   rate: "5.0500", maturity: "13/05/2026", days: 4,    mtm: -2.84, dv01: "BRL 23k", urgent: "critical" },
        { company: "Vale S.A.",            side: "Short", notional: "USD 180m",   rate: "5.1180", maturity: "28/05/2026", days: 19,   mtm: 1.42,  dv01: "BRL 17k" },
        { company: "Vale Canadá Mining",   side: "Short", notional: "USD 320m",   rate: "5.1620", maturity: "16/06/2026", days: 38,   mtm: 4.15,  dv01: "BRL 31k" },
        { company: "Salobo Metais",        side: "Short", notional: "USD 150m",   rate: "5.2010", maturity: "31/07/2026", days: 83,   mtm: 5.02,  dv01: "BRL 18k" },
      ],
      "Spot FX": [],
      "Options": [
        { company: "Vale S.A.",            side: "Short", notional: "USD 120m", rate: "Collar 5.45/5.78", maturity: "20/06/2026", days: 42, mtm: -0.92, dv01: "BRL 8k" },
        { company: "Vale Manganês",        side: "Long",  notional: "USD 80m",  rate: "Put 5.30",         maturity: "15/08/2026", days: 98, mtm: 1.78,  dv01: "BRL 6k" },
      ],
      "Swaps": [
        { company: "Vale S.A.",            side: "Recv",  notional: "USD 500m", rate: "CCS USD→BRL 4.5y", maturity: "30/11/2030", days: 1666, mtm: 18.42, dv01: "BRL 412k" },
      ],
      "Fixed Income": [
        { company: "Vale S.A.",            side: "Long",  notional: "BRL 850m",   rate: "CDB DI+0.85%",        maturity: "15/12/2026", days: 220,  mtm: 0.34, dv01: "BRL 89k" },
        { company: "Vale Fertilizantes",   side: "Long",  notional: "BRL 1.200m", rate: "Compromissada SELIC", maturity: "12/05/2026", days: 3,    mtm: 0.02, dv01: "BRL 12k", urgent: "urgent" },
        { company: "Vale S.A.",            side: "Long",  notional: "BRL 480m",   rate: "Letra Fin. IPCA+5.4%",maturity: "20/03/2029", days: 1045, mtm: 2.18, dv01: "BRL 124k" },
      ],
    },
    trades: {
      "NDF": [
        { date: "07/05/2026", company: "Vale S.A.",          side: "Short", notional: "USD 80m",  rate: "5.4220", spread: 8,  spreadMax: 12, seller: "Costa" },
        { date: "29/04/2026", company: "Vale Canadá Mining", side: "Short", notional: "USD 120m", rate: "5.4015", spread: 9,  spreadMax: 12, seller: "Costa" },
        { date: "11/04/2026", company: "Vale S.A.",          side: "Short", notional: "USD 200m", rate: "5.3850", spread: 6,  spreadMax: 12, seller: "Costa" },
        { date: "02/04/2026", company: "Salobo Metais",      side: "Short", notional: "USD 60m",  rate: "5.4470", spread: 11, spreadMax: 12, seller: "Costa" },
      ],
      "Spot FX": [
        { date: "06/05/2026", company: "Vale S.A.",          side: "Buy",   notional: "USD 25m",  rate: "5.0820", spread: 4,  spreadMax: 12, seller: "Costa" },
        { date: "21/04/2026", company: "Vale S.A.",          side: "Sell",  notional: "USD 18m",  rate: "5.0843", spread: 5,  spreadMax: 12, seller: "Costa" },
      ],
      "Options": [
        { date: "05/05/2026", company: "Vale Manganês",      side: "Long",  notional: "USD 80m",  rate: "Put 5.30",  spread: 11, spreadMax: 18, seller: "Albuquerque" },
        { date: "17/04/2026", company: "Vale S.A.",          side: "Short", notional: "USD 60m",  rate: "Collar",    spread: 14, spreadMax: 22, seller: "Albuquerque" },
      ],
      "Swaps": [
        { date: "11/04/2026", company: "Vale S.A.",          side: "Recv",  notional: "USD 200m", rate: "CCS 4.5y",  spread: 22, spreadMax: 30, seller: "Albuquerque" },
      ],
      "Fixed Income": [
        { date: "02/05/2026", company: "Vale S.A.",          side: "Long",  notional: "BRL 250m", rate: "CDB DI+",   spread: 6, spreadMax: 10, seller: "Mendes" },
        { date: "24/04/2026", company: "Vale Fertilizantes", side: "Long",  notional: "BRL 600m", rate: "Compromissada", spread: 3, spreadMax: 8,  seller: "Mendes" },
      ],
    },
  },

  // Documents: summary + drill-in details
  documents: {
    cgd:    { status: "active",  count: 5, since: "12/03/2024", lastUpdate: "08/11/2025",
              items: [
                { name: "Master Derivatives Agreement (CGD)", sub: "B3 / CETIP registered",  date: "12/03/2024", status: "active" },
                { name: "Amendment #4 — ISDA Annex",          sub: "Cross-default updated",   date: "08/11/2025", status: "active" },
                { name: "Schedule — Eligible Collateral",     sub: "Cash + LTNs accepted",    date: "08/11/2025", status: "active" },
                { name: "CSA — Mark-to-Market",               sub: "Bilateral, daily VM",     date: "12/03/2024", status: "active" },
                { name: "Side letter — Threshold Adj.",       sub: "Pending counterparty",    date: "02/05/2026", status: "pending" },
              ] },
    fx:     { status: "active", count: 4, since: "15/06/2023", lastUpdate: "30/04/2026",
              items: [
                { name: "Contrato de Câmbio Modelo I",        sub: "Spot FX framework",       date: "15/06/2023", status: "active" },
                { name: "Decl. CCS Bacen #4790",              sub: "Iron ore export inflows", date: "10/01/2026", status: "active" },
                { name: "Limite Operacional FX",              sub: "USD 800m / day",          date: "10/01/2026", status: "active" },
                { name: "Renovação anual",                    sub: "Awaiting compliance",     date: "30/04/2026", status: "warning" },
              ] },
    credit: { approved: 1100, used: 779, available: 321, utilization: 71, ccy: "BRL m", trend: "+4 pp WoW", lastReview: "10/04/2026",
              items: [
                { line: "Derivatives — total",   approved: 1100, used: 779, util: 71 },
                { line: "  · NDF",               approved: 600,  used: 482, util: 80 },
                { line: "  · Options",           approved: 250,  used: 168, util: 67 },
                { line: "  · Swaps",             approved: 250,  used: 129, util: 52 },
              ] },
  },

  notes: {
    personal: [
      {
        id: "n1", aiPulled: true, author: "You", ts: "02/05/2026 14:22",
        body: "<strong>CFO follow-up.</strong> Treasurer (Carla M.) flagged she wants to <strong>revisit FX hedge ratio</strong> after Q1 earnings — sees iron ore vol persisting. Asked us to model 70% / 80% / 90% hedge scenarios on next 12m USD inflows.<br><br>Next step: send scenarios by 15 May. <span class=\"jv-htag\">#hedge-discussion</span>"
      },
      {
        id: "n2", aiPulled: true, author: "You", ts: "21/04/2026 09:48",
        body: "Closed <strong>NDF USD/BRL R$ 600m short</strong> at 5.4185 — 9 bps over screen. Treasurer accepted first quote, no shopping. Comment: <em>\"keep us posted on iron ore vol; we may add another 200m mid-May.\"</em> <span class=\"jv-htag\">#won-deal</span>"
      },
      {
        id: "n3", author: "You", ts: "12/03/2026 16:10",
        body: "Quarterly review call with Ferraiolo joining. Vale wants tighter integration of <strong>CCS pricing into balance-sheet</strong> — explore offering 5y indicative grid weekly.<br><br>This note got long: detailed agenda below covers the new collateral framework, the cross-currency swap pipeline for the next four quarters, the regulatory updates from BACEN that we touched on, the proposed weekly grid template Costa is drafting, and the open questions on whether Vale wants us to extend the existing CSA or write a fresh annex with Vale Canadá Mining specifically. Treasurer also asked about how we&rsquo;d treat the netting set in case of a downgrade event, which will need credit&rsquo;s input before we respond. Action items: (1) Costa to draft the weekly grid template by 20/03; (2) confirm B3 limit headroom against current CCS book; (3) align with Nery on credit headroom for Vale Canadá; (4) Ferraiolo to set up follow-up with treasurer for early April. <span class=\"jv-htag\">#hedge-discussion</span> <span class=\"jv-htag\">#ccs</span>"
      },
    ],
    team: [
      {
        id: "t1", aiPulled: true, author: "Domenes", ts: "20/04/2026 11:05",
        body: "<strong>Treasurer mentioned reviewing hedge policy in Q1.</strong> They are running a board memo. Window for us to propose collar restructuring is short — push by mid-May.<br><br>Also: credit review came back clean, headroom of ~R$ 320m for new derivatives. <span class=\"jv-htag\">#credit-review</span>"
      },
      {
        id: "t2", author: "Costa", ts: "07/05/2026 10:32",
        body: "NDF USD 80m @ 5.4220 — 8 bps. Quick. Carla on the call also said <em>\"check on the maturing 250m next week\"</em> — relayed to coverage. <span class=\"jv-htag\">#won-deal</span>"
      },
      {
        id: "t3", author: "Albuquerque", ts: "17/04/2026 15:14",
        body: "Lost <strong>USD Collar 60m</strong> to Itaú — they showed inside our offer by 4 bps. Carla apologetic but firm. We need to revisit Options pricing matrix vs peers. <span class=\"jv-htag\">#lost-deal</span>"
      },
    ],
  },
};
