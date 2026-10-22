# BoosterBench website (boosterbench.com)

Plain HTML, CSS and JavaScript. No build step.

- `index.html` home, `features.html`, `pricing.html`, `safety.html`, `help.html`, `contact.html`, `404.html`
- `assets/site.css` styles (navy #13294B, gold #FFB81C, Barlow Condensed + Figtree)
- `assets/help-data.js` every help question and answer. The Help page, its search box and the
  "Ask a question" helper all read from this one list. Add a question here and it shows up everywhere.
- `assets/site.js` menu, help search, helper, and the contact form
- `assets/img/` app screenshots (fictional Lakeview school only, never real student data)

Hosting: Netlify, set up by `netlify.toml`. Every change to `main` goes live automatically. The contact form uses Netlify Forms (form name `walkthrough`).

The helper matches questions to the help pages today. To switch it to AI later, set
`window.BB_HELPER_ENDPOINT` to a service that answers only from `help-data.js`.

Preview on your computer: `npx serve .` (or open `index.html` in a browser).

Page source: the shared header, footer and page bodies live in `.tools/pages.py`. Edit there and run
`python3 .tools/build.py` to regenerate the HTML pages (or edit the HTML directly for tiny fixes).

## The app on the web (/app)

`app/` is the web version of the BoosterBench app, built from the private `boosterbench-app`
repo. Don't edit it by hand. To update it, run `npm run build:web` in `boosterbench-app`
(it replaces this folder), then commit here. Live at https://boosterbench.com/app.
