# Padelguru Nusa Dua — Projektnotizen

## Überblick
Website für Padel Guru Nusa Dua, Bali's Premier Padel Club.
Fünf Courts, Café, Sauna, Proshop – Booking-Modal integriert.

## Stack
- Plain HTML / CSS / JS (keine Frameworks)
- Fonts: Bricolage Grotesque (Display) + DM Sans (Body) via Google Fonts

## Design System
- **Stil:** Refined Tropical Editorial + Liquid Glass UI (Apple-Stil)
- **Farben:** Forest Green (`#2d3f1f`) + Mint (`#d4e8d4`) + Bone (`#f5f1ea`)
- **Buttons:** Pill-shape (border-radius: 999px), Liquid Glass Varianten
- **Glass-Effekte:** backdrop-filter blur + saturate(180%) auf Nav, Hero-Widget, Modal-Panel, Tags, Buttons

## Deployment
- **GitHub:** https://github.com/amack533/padelguru
- **Hosting:** Cloudflare Pages (auto-deploy bei jedem Push auf `main`)
- Workflow: Änderung lokal → `git add` → `git commit` → `git push` → live

## Mobile
- Quick-Book Widget (Datum/Spieler-Felder) auf Mobile ausgeblendet
- Nur "Find Slots →" CTA-Button sichtbar → öffnet Booking Modal
- Booking Modal ist für Mobile optimiert

## Seiten
- `index.html` — Startseite (Hero, Courts, Facilities, Location, CTA)
- `about.html` — About-Seite
- `style.css` — Alle Styles (eine Datei)
- `app.js` — Booking Modal Logik

## Bekannte Entscheidungen
- iOS-Zoom-Prevention: `font-size: 1rem` auf Inputs im Mobile-Breakpoint
- Kein Build-Prozess, kein Framework – direktes Editieren der HTML/CSS-Dateien
