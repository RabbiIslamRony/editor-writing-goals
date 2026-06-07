# WordPress.org Assets

These files are prepared for the WordPress.org SVN repository.

The GitHub workflow in `.github/workflows/deploy-wordpress-org.yml` uses these files automatically through `ASSETS_DIR=wordpress-org-assets/assets`.

Copy the contents of `wordpress-org-assets/assets/` into the SVN checkout root `assets/` directory, beside `trunk/` and `tags/`.

Expected SVN layout:

```text
editor-writing-goals/
  assets/
    banner-772x250.png
    banner-1544x500.png
    icon-128x128.png
    icon-256x256.png
    screenshot-1.png
    screenshot-2.png
  trunk/
  tags/
```

Screenshots are captioned by the `== Screenshots ==` section in `readme.txt`.
