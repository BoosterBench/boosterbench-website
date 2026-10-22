// BoosterBench site scripts: mobile menu, help search, the help helper,
// and the contact form.
(function () {
  "use strict";

  // ---------- Mobile menu ----------
  var menuBtn = document.querySelector(".menu-btn");
  var nav = document.getElementById("site-nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.textContent = open ? "Close" : "Menu";
    });
  }

  var HELP = window.BB_HELP || [];
  var GROUPS = window.BB_HELP_GROUPS || [];

  // ---------- Matching (used by search and the helper) ----------
  var STOP = "a an and are as at be but by can do does for from get got have how i if in is it its me my of on or our so that the their them then there they this to us we what when where which who why will with you your yours".split(" ");
  var SYN = {
    sold: "sell", selling: "sell", price: "cost", pricing: "cost", fee: "cost", fees: "cost", charge: "cost", expensive: "cost", much: "cost",
    text: "message", texting: "message", dm: "message", messaging: "message", messages: "message", chat: "message",
    kid: "child", kids: "child", son: "child", daughter: "child", children: "child",
    signup: "volunteer", volunteering: "volunteer", volunteers: "volunteer", helper: "volunteer",
    donate: "donations", donation: "donations", give: "donations", fundraiser: "donations", fundraising: "donations",
    pics: "photos", pictures: "photos", picture: "photos", photo: "photos",
    safe: "safety", secure: "safety", security: "safety", private: "privacy",
    schedules: "schedule", games: "schedule", game: "schedule", calendar: "schedule",
    rides: "carpool", ride: "carpool", driving: "carpool",
    register: "registration", registrations: "registration", signups: "registration",
    phone: "iphone", android: "iphone"
  };
  function words(text) {
    return String(text || "").toLowerCase().replace(/<[^>]+>/g, " ").replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/).filter(function (w) { return w && STOP.indexOf(w) === -1; })
      .map(function (w) {
        if (SYN[w]) return SYN[w];
        if (w.length > 4 && /ies$/.test(w)) w = w.slice(0, -3) + "y";
        else if (w.length > 4 && /(ches|shes|xes)$/.test(w)) w = w.slice(0, -2);
        else if (w.length > 3 && /[^s]s$/.test(w)) w = w.slice(0, -1);
        return SYN[w] || w;
      });
  }
  var indexed = HELP.map(function (item) {
    return { item: item, q: words(item.q), k: words(item.keys), a: words(item.a) };
  });
  function score(entry, terms) {
    var s = 0;
    terms.forEach(function (t) {
      var stem = t.length > 4 ? t.slice(0, t.length - 1) : t;
      function hit(list) { return list.some(function (w) { return w === t || (stem.length > 3 && w.indexOf(stem) === 0); }); }
      if (hit(entry.q)) s += 3;
      if (hit(entry.k)) s += 2;
      if (hit(entry.a)) s += 1;
    });
    return s;
  }
  function bestMatches(query, limit) {
    var terms = words(query);
    if (!terms.length) return [];
    return indexed.map(function (e) { return { item: e.item, s: score(e, terms) }; })
      .filter(function (r) { return r.s >= 3; })
      .sort(function (a, b) { return b.s - a.s; })
      .slice(0, limit || 3);
  }
  function groupTitle(id) {
    for (var i = 0; i < GROUPS.length; i++) if (GROUPS[i].id === id) return GROUPS[i].title;
    return "";
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var onHelpPage = !!document.getElementById("help-list");
  function helpLink(id) { return (onHelpPage ? "" : "help.html") + "#" + id; }

  // ---------- Help page: list + live search ----------
  var list = document.getElementById("help-list");
  var search = document.getElementById("help-search");
  var helpNav = document.getElementById("help-nav");
  function renderHelp(query) {
    if (!list) return;
    var matchIds = null;
    if (query && query.trim()) {
      matchIds = {};
      bestMatches(query, 50).forEach(function (r) { matchIds[r.item.id] = true; });
    }
    var html = "";
    var shown = 0;
    GROUPS.forEach(function (g) {
      var items = HELP.filter(function (i) { return i.cat === g.id && (!matchIds || matchIds[i.id]); });
      if (!items.length) return;
      shown += items.length;
      html += '<section class="help-group" id="' + g.id + '"><h2>' + esc(g.title) + "</h2>";
      items.forEach(function (i) {
        html += '<details class="qa" id="' + i.id + '"' + (matchIds ? " open" : "") + "><summary>" + esc(i.q) + '</summary><div class="ans">' + i.a + "</div></details>";
      });
      html += "</section>";
    });
    if (!shown) {
      html = '<div class="no-results"><p><b>No help pages match "' + esc(query) + '".</b></p><p>Try other words, or email <span class="email-line">hello@boosterbench.com</span> and we\'ll answer and add it here.</p></div>';
    }
    list.innerHTML = html;
  }
  if (list) {
    if (helpNav) {
      helpNav.innerHTML = GROUPS.map(function (g) { return '<a href="#' + g.id + '">' + esc(g.title) + "</a>"; }).join("");
    }
    renderHelp("");
    if (search) {
      search.addEventListener("input", function () { renderHelp(search.value); });
      var form = search.closest("form");
      if (form) form.addEventListener("submit", function (e) { e.preventDefault(); renderHelp(search.value); });
    }
    // Open a question linked by #id
    var openFromHash = function () {
      var id = (location.hash || "").slice(1);
      if (!id) return;
      var el = document.getElementById(id);
      if (el && el.tagName === "DETAILS") { el.open = true; el.scrollIntoView({ block: "start" }); }
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
  }

  // ---------- Help helper (floating "Ask a question") ----------
  // Today it answers by matching the question to the help pages above.
  // When an AI service is connected, set window.BB_HELPER_ENDPOINT and the
  // helper will send the question there instead. That service must answer
  // only from these same help pages.
  var ENDPOINT = window.BB_HELPER_ENDPOINT || "";
  var STARTERS = ["What does it cost?", "How are volunteer hours tracked?", "Can my teen have an account?", "Does it work for Little League?"];

  function buildHelper() {
    if (!HELP.length || document.getElementById("helper-panel")) return;
    var fab = document.createElement("button");
    fab.className = "helper-fab";
    fab.type = "button";
    fab.id = "helper-fab";
    fab.setAttribute("aria-controls", "helper-panel");
    fab.setAttribute("aria-expanded", "false");
    fab.textContent = "Ask a question";

    var panel = document.createElement("div");
    panel.className = "helper-panel";
    panel.id = "helper-panel";
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "BoosterBench help");
    panel.innerHTML =
      '<div class="helper-head"><b>BoosterBench Help</b><button type="button" aria-label="Close help">×</button></div>' +
      '<div class="helper-log" id="helper-log" aria-live="polite"></div>' +
      '<p class="helper-note">Answers come only from our public help pages.</p>' +
      '<form class="helper-form" id="helper-form"><label for="helper-input" class="hp">Your question</label>' +
      '<input id="helper-input" type="text" autocomplete="off" placeholder="Type a question" maxlength="300">' +
      '<button type="submit">Ask</button></form>';

    document.body.appendChild(panel);
    document.body.appendChild(fab);

    var log = panel.querySelector("#helper-log");
    var input = panel.querySelector("#helper-input");

    function addBubble(cls, html) {
      var b = document.createElement("div");
      b.className = "bubble " + cls;
      b.innerHTML = html;
      log.appendChild(b);
      log.scrollTop = log.scrollHeight;
      return b;
    }
    function greet() {
      var b = addBubble("bot", "<p>Hi! Ask me anything about BoosterBench: how it works, what it costs, or how we keep students safe.</p>");
      var s = document.createElement("div");
      s.className = "suggests";
      STARTERS.forEach(function (q) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = q;
        btn.addEventListener("click", function () { ask(q); });
        s.appendChild(btn);
      });
      b.appendChild(s);
    }
    function answerLocally(q) {
      var found = bestMatches(q, 3);
      if (!found.length) {
        addBubble("bot", "<p>I couldn't find that in our help pages. Email <b>hello@boosterbench.com</b> or use the <a href=\"contact.html\">contact form</a> and a person will answer.</p>");
        return;
      }
      var top = found[0].item;
      var more = found.slice(1).map(function (r) { return '<a href="' + helpLink(r.item.id) + '">' + esc(r.item.q) + "</a>"; }).join(" · ");
      addBubble("bot", "<p><b>" + esc(top.q) + "</b></p>" + top.a +
        '<p class="src">From <a href="' + helpLink(top.id) + '">' + esc(groupTitle(top.cat)) + "</a>" + (more ? "<br>Related: " + more : "") + "</p>");
    }
    function ask(q) {
      q = String(q || "").trim();
      if (!q) return;
      addBubble("me", esc(q));
      input.value = "";
      if (!ENDPOINT) { answerLocally(q); return; }
      var wait = addBubble("bot", "<p>Looking that up…</p>");
      fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: q }) })
        .then(function (r) { if (!r.ok) throw new Error("bad"); return r.json(); })
        .then(function (data) {
          wait.innerHTML = "<p>" + esc(data.answer || "") + "</p>" +
            (data.sources && data.sources.length ? '<p class="src">From: ' + data.sources.map(function (id) {
              var it = HELP.filter(function (h) { return h.id === id; })[0];
              return it ? '<a href="' + helpLink(it.id) + '">' + esc(it.q) + "</a>" : "";
            }).join(" · ") + "</p>" : "");
        })
        .catch(function () { wait.remove(); answerLocally(q); });
    }
    function setOpen(open) {
      panel.hidden = !open;
      fab.setAttribute("aria-expanded", open ? "true" : "false");
      fab.textContent = open ? "Close help" : "Ask a question";
      if (open) {
        if (!log.childElementCount) greet();
        input.focus();
      }
    }
    fab.addEventListener("click", function () { setOpen(panel.hidden); });
    panel.querySelector(".helper-head button").addEventListener("click", function () { setOpen(false); fab.focus(); });
    panel.querySelector("#helper-form").addEventListener("submit", function (e) { e.preventDefault(); ask(input.value); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) { setOpen(false); fab.focus(); } });
    document.querySelectorAll("[data-open-helper]").forEach(function (el) {
      el.addEventListener("click", function (e) { e.preventDefault(); setOpen(true); });
    });
  }
  buildHelper();

  // ---------- Contact form (Netlify Forms) ----------
  var cform = document.getElementById("contact-form");
  if (cform) {
    var status = document.getElementById("form-status");
    cform.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!cform.reportValidity()) return;
      var btn = cform.querySelector("button[type=submit]");
      btn.disabled = true;
      btn.textContent = "Sending…";
      var body = new URLSearchParams(new FormData(cform)).toString();
      fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body })
        .then(function (r) {
          if (!r.ok) throw new Error("bad");
          status.className = "form-status ok";
          status.textContent = "Thanks! Your request was sent. We'll email you within two business days to set up a walkthrough.";
          status.hidden = false;
          cform.reset();
        })
        .catch(function () {
          status.className = "form-status err";
          status.innerHTML = "That didn't go through. Please email us at <b>hello@boosterbench.com</b> instead.";
          status.hidden = false;
        })
        .then(function () { btn.disabled = false; btn.textContent = "Request a walkthrough"; });
    });
  }
})();
