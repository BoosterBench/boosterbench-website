import os, sys
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")

NAV = [("index.html", "Home"), ("features.html", "Features"), ("pricing.html", "Pricing"), ("safety.html", "Safety"), ("help.html", "Help")]

def head(title, desc, page):
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="claude:viewport-fit-sides" content="cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:url" content="https://boosterbench.com/{'' if page == 'index.html' else page}">
<meta property="og:image" content="https://boosterbench.com/assets/app-icon.png">
<meta name="theme-color" content="#13294B">
<link rel="canonical" href="https://boosterbench.com/{'' if page == 'index.html' else page}">
<link rel="icon" type="image/png" href="assets/favicon.png">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Figtree:wght@400;500;600;700;800&display=swap">
<link rel="stylesheet" href="assets/site.css">
</head>
<body>
<a href="#main" class="hp">Skip to content</a>
<header class="site-header">
  <div class="wrap">
    <a class="brand" href="index.html" aria-label="BoosterBench home"><img src="assets/logo.svg" alt="" width="30" height="46"><span>Booster<b>Bench</b></span></a>
    <button class="menu-btn" type="button" aria-controls="site-nav" aria-expanded="false">Menu</button>
    <nav class="nav" id="site-nav" aria-label="Main">
''' + "\n".join(f'      <a href="{href}"{" aria-current=\"page\"" if href == page else ""}>{label}</a>' for href, label in NAV) + '''
      <a class="btn btn-gold" href="contact.html">Book a walkthrough</a>
    </nav>
  </div>
</header>
<main id="main">
'''

FOOT = '''</main>
<footer class="site-footer">
  <div class="wrap">
    <div class="stack" style="gap:10px">
      <a class="brand" href="index.html"><img src="assets/logo.svg" alt="" width="30" height="46"><span>Booster<b>Bench</b></span></a>
      <p>Boost your bench. One app for schedules, team chat, volunteers, events and fundraising.</p>
      <p class="fine">BoosterBench is in development. Features and pricing are planned and may change before launch. Privacy commitments are pending review by a lawyer.</p>
    </div>
    <nav aria-label="Footer">
      <span class="foot-title">Product</span>
      <a href="features.html">Features</a>
      <a href="pricing.html">Pricing</a>
      <a href="safety.html">Safety and privacy</a>
      <a href="help.html">Help and FAQ</a>
    </nav>
    <nav aria-label="Contact">
      <span class="foot-title">Talk to us</span>
      <a href="contact.html">Book a walkthrough</a>
      <span>hello@boosterbench.com</span>
      <span class="fine">© 2026 BoosterBench</span>
    </nav>
  </div>
</footer>
<script src="assets/help-data.js"></script>
<script src="assets/site.js"></script>
</body>
</html>
'''

CTA = '''<section class="cta">
  <div class="wrap">
    <div class="stack" style="gap:8px">
      <h2>Be a founding pilot</h2>
      <p>We're inviting a few schools, booster clubs and programs to try BoosterBench this season, with your name on the app. It starts with a 20-minute walkthrough.</p>
    </div>
    <a class="btn" href="contact.html">Book a walkthrough</a>
  </div>
</section>
'''

def page(name, title, desc, body):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(head(title, desc, name) + body + FOOT)

exec(open(os.path.join(os.path.dirname(__file__), "pages.py")).read())
