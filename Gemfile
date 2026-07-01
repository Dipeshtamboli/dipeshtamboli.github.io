source "https://rubygems.org"

# Matches the GitHub Pages build environment (Jekyll + supported plugins).
gem "github-pages", group: :jekyll_plugins

# Local-dev conveniences on newer Ruby.
gem "webrick", "~> 1.8"

# LOCAL-ONLY pin: system Ruby is 2.6, but ffi 1.17 needs Ruby >= 3.0.
# GitHub Pages builds with its own locked environment and ignores this.
gem "ffi", "< 1.17"
