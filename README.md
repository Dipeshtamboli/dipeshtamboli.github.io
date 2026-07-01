# dipeshtamboli.github.io

Source for **Dipesh Tamboli's** personal academic website — live at **https://dipeshtamboli.github.io/**.

Dipesh is a Research Scientist at Meta working on alignment, privacy-preserving training, and trustworthiness of large language and foundation models.

Built with **Jekyll** (the same engine GitHub Pages runs), so pages share layouts/includes and the content lives in data files.

## Structure

```
_config.yml         Site config, plugins (seo-tag, sitemap), cache-bust version
_layouts/
  default.html      Page skeleton (head + nav + footer + scripts)
_includes/
  head.html         <head>, per-page favicon, fonts, CSS, SEO tags
  nav.html          Top nav + mobile hamburger (active state per page)
  footer.html
  timeline.html     Career timeline, rendered from _data/timeline.json
  pub-card.html     Renders one publication
  media-card.html   Renders one media-coverage card
_data/
  publications.json Publications (single source of truth)
  media.json        Media coverage, grouped by tier
  timeline.json     Timeline bands + nodes
  news.json         News items
  awards.json       Awards
index.html          Home (hero, about, timeline, news, selected pubs, awards)
publications.html   Full publication list (loops _data/publications.json)
media.html          Media coverage (loops _data/media.json)
site.css            Shared styles (light/dark theme)
theme.js            Dark-mode toggle + mobile hamburger menu
images/  docs/      Logos, thumbnails, favicons, profile photo, resume
```

### Updating content

- **Add a paper** → add an entry to `_data/publications.json` (set `section`, and
  `featured: true` to also show it on the home page).
- **Add media coverage** → add a card under the right tier in `_data/media.json`.
- **News / awards / timeline** → edit the matching `_data/*.json` file.

No HTML editing needed for routine content updates.

## Local preview

```bash
bundle install          # first time (installs Jekyll via the github-pages gem)
bundle exec jekyll serve # http://127.0.0.1:4000/
```

GitHub Pages builds the site automatically on push to the publishing branch — no CI needed.

## License

Content (text, images, CV) © Dipesh Tamboli. Feel free to take inspiration from the layout/code for your own site.
