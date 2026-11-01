/* TradingAnalyzer : analyses claires + résultats.
   Pour ajouter une analyse, copiez une ligne dans la liste ANALYSES ci-dessous.
   statut : "en cours", "gagnée" ou "perdue"   |   direction : "achat", "vente" ou "attendre"
   N'y mettez que de VRAIES analyses. */
(function () {
  "use strict";
  var ANALYSES = [
    // {date:"2026-11-01", direction:"achat", entree:0000, sl:0000, tp:0000, statut:"en cours", pourquoi:"Explication en une ou deux phrases simples.", invalidation:"Sous 0000, l’analyse n’est plus valable."},
  ];

  var gallery = document.getElementById("analysesGallery");
  if (!gallery) return;

  var css = ".ar-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:12px 0}" +
    ".ar-stat{background:#0d1727;border:1px solid var(--line);border-radius:9px;padding:9px}" +
    ".ar-stat small{display:block;color:var(--muted);font-size:11px}.ar-stat b{font-size:20px}" +
    ".ar-card{background:#0d1727;border:1px solid var(--line);border-radius:10px;padding:12px;margin-top:10px}" +
    ".ar-top{display:flex;justify-content:space-between;align-items:center;gap:8px}" +
    ".ar-dir{font-weight:800;font-size:16px}.ar-dir.achat,.ar-win{color:var(--green)}" +
    ".ar-dir.vente,.ar-loss{color:var(--red)}.ar-dir.attendre{color:var(--muted)}.ar-run{color:var(--gold)}" +
    ".ar-tag{font-size:12px;font-weight:700;padding:2px 9px;border-radius:99px;border:1px solid currentColor}" +
    ".ar-lv{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0}" +
    ".ar-lv div{border:1px solid var(--line);border-radius:8px;padding:6px 8px}" +
    ".ar-lv small{display:block;color:var(--muted);font-size:11px}.ar-lv b{font-size:16px}" +
    ".ar-why{margin:0;color:var(--muted);font-size:13px;line-height:1.5}" +
    "@media(max-width:480px){.ar-stats{grid-template-columns:1fr 1fr}}";
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  function esc(t) { var d = document.createElement("div"); d.textContent = String(t); return d.innerHTML; }
  function num(x) { return Number(x).toLocaleString("fr-FR"); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function day(s) { return new Date(s + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }); }
  function pts(a) {
    if (a.statut === "gagnée") return Math.abs(a.tp - a.entree);
    if (a.statut === "perdue") return -Math.abs(a.entree - a.sl);
    return 0;
  }
  function cls(s) { return s === "gagnée" ? "ar-win" : s === "perdue" ? "ar-loss" : "ar-run"; }

  var body;
  if (!ANALYSES.length) {
    body = '<p class="note" style="margin-top:12px">Aucune analyse suivie pour le moment.</p>';
  } else {
    var closed = ANALYSES.filter(function (a) { return a.statut !== "en cours"; });
    var wins = closed.filter(function (a) { return a.statut === "gagnée"; }).length;
    var net = closed.reduce(function (s, a) { return s + pts(a); }, 0);
    var rate = closed.length ? Math.round(wins / closed.length * 100) : 0;
    body = '<div class="ar-stats">' +
      '<div class="ar-stat"><small>Terminées</small><b>' + closed.length + '</b></div>' +
      '<div class="ar-stat"><small>Réussite</small><b>' + rate + ' %</b></div>' +
      '<div class="ar-stat"><small>Gagnées / perdues</small><b>' + wins + ' / ' + (closed.length - wins) + '</b></div>' +
      '<div class="ar-stat"><small>Net (points)</small><b class="' + (net >= 0 ? "ar-win" : "ar-loss") + '">' + (net > 0 ? "+" : "") + num(net) + '</b></div></div>' +
      ANALYSES.slice().sort(function (a, b) { return b.date.localeCompare(a.date); }).map(function (a) {
        return '<article class="ar-card"><div class="ar-top"><span class="ar-dir ' + esc(a.direction) + '">' + esc(cap(a.direction)) + ' XAU/USD</span>' +
          '<span class="ar-tag ' + cls(a.statut) + '">' + esc(cap(a.statut)) + '</span></div>' +
          '<div class="note">' + esc(day(a.date)) + '</div>' +
          '<div class="ar-lv"><div><small>Entrée</small><b>' + num(a.entree) + '</b></div>' +
          '<div><small>Stop Loss</small><b>' + num(a.sl) + '</b></div>' +
          '<div><small>Take Profit</small><b>' + num(a.tp) + '</b></div></div>' +
          '<p class="ar-why">' + esc(a.pourquoi) + '</p>' +
          '<p class="ar-why"><b>Invalidation :</b> ' + esc(a.invalidation) + '</p></article>';
      }).join("");
  }

  var wrap = document.createElement("div");
  wrap.innerHTML =
    '<section class="panel"><div class="section-title">Analyses suivies et résultats</div>' +
    '<div class="note">Les gains et les pertes sont affichés, sans tri. Les performances passées ne garantissent pas les résultats futurs.</div>' + body + '</section>' +
    '<section class="panel"><div class="section-title">Comment lire une analyse</div>' +
    '<p class="note"><b>Entrée</b> : prix où l’on ouvre la position. <b>Stop Loss</b> : prix où l’on sort si l’analyse échoue. <b>Take Profit</b> : prix où l’on encaisse le gain visé. <b>Invalidation</b> : niveau à partir duquel l’analyse n’est plus valable.</p>' +
    '<button type="button" class="premium-cta" id="arCta">Voir les abonnements</button></section>';
  while (wrap.firstChild) gallery.parentNode.insertBefore(wrap.firstChild, gallery);

  var cta = document.getElementById("arCta");
  if (cta) cta.addEventListener("click", function () {
    var item = document.querySelector('.nav-item[data-page="subscriptionPage"]');
    if (item) item.click();
  });
})();
