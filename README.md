# Shanmuganathan S - Portfolio Website

Static website (HTML, CSS, JavaScript). No build step. Double-click `index.html` to preview.

## Folder structure

```
portfolio/
├── index.html            main page (all sections)
├── css/style.css         styles and colours (edit :root variables at the top)
├── js/main.js            theme toggle, menu, typed text, contact form
├── lib/
│   ├── aos/              scroll animation library
│   └── typed/            typing animation library
├── img/                  logo, favicon and sample images (replace with your own)
├── assets/
│   └── Shanmuganathan_Resume.pdf   download button file
├── robots.txt
└── README.md
```

## Replace the sample images

Keep the same file names, or update the `src` in `index.html`.

| File | Size | Use |
|---|---|---|
| `img/profile.png` | 600 x 600 | Hero photo, transparent background so the site background shows through (cut out your own with remove.bg or Canva) |
| `img/about.jpg` | 700 x 560 | About section |
| `img/hero-bg.svg` | 1600 x 900 | Hero background |
| `img/og-image.jpg` | 600 x 600 | Link preview image (`og:image`), your photo with its original navy backdrop |
| `img/logo-on-light.png`, `img/logo-on-dark.png` | transparent PNG | SN logo in the header (navy/teal on light backgrounds, bright teal on dark ones; swapped automatically) |
| `img/logo-original.png` | transparent PNG | Your original blue SN logo, kept for reference |
| `img/favicon.png`, `img/apple-touch-icon.png` | 64 / 180 px | Browser tab and phone home-screen icon (SN logo on a white tile) |

If your new image is a `.jpg` or `.png`, change the extension in `index.html` too (search for `img/`).
For the hero background, edit the `url('../img/hero-bg.svg')` line in `css/style.css`.

## Edit your content

- **Rotating roles in the hero:** `js/main.js`, the `roles` array.
- **Stats numbers:** `index.html`, `data-to="..."` in the Stats section.
- **Colours:** top of `css/style.css` (`--accent`, `--accent-2`).
- **Resume:** replace `assets/Shanmuganathan_Resume.pdf` with a newer file of the same name.

## Contact form

The form opens the visitor's email app (mailto). To receive messages directly, create a free form at Formspree or Web3Forms, then set the form's `action` to the URL they give you and remove the submit handler in `js/main.js`.

## Publish for free

Upload the folder to Netlify Drop, Cloudflare Pages, GitHub Pages or Vercel. `index.html` must stay in the root.
After publishing, set `og:image` to a full URL (https://yourdomain/img/og-image.jpg).
