# dipeshtamboli.github.io

Source for **Dipesh Tamboli's** personal academic website — live at **https://dipeshtamboli.github.io/**.

Dipesh is a Research Scientist at Meta working on alignment, privacy-preserving training, and trustworthiness of large language and foundation models.

## Structure

```
index.html          Home — hero, about, timeline, news, selected publications, awards
publications.html   Full publication list (venue-type color coding, links, citations)
media.html          Media coverage (per-outlet preview cards + thumbnails)
site.css            Shared styles (light/dark theme)
theme.js            Dark-mode toggle + mobile hamburger menu
images/             Logos, media thumbnails, favicon assets
docs/               Profile photo, resume
```

It's a static site (plain HTML/CSS/JS) served by GitHub Pages — no build step.

## Local preview

```bash
python3 -m http.server 8765
# then open http://127.0.0.1:8765/
```

## License

Content (text, images, CV) © Dipesh Tamboli. Feel free to take inspiration from the layout/code for your own site.
