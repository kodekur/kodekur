# Kodekur E-Commerce Platform - Copilot Instructions

## Project Overview

**Kodekur** is a plant collection e-commerce website for a private Russian horticultural collection specializing in decorative perennials, shrubs, conifers, and herbs. The site spans three seasonal ordering cycles (Spring/Summer/Autumn) with ~2,000 plant varieties across 30 acres in Vladimir Oblast, Russia.

### Architecture: Google Sheets-Driven Frontend

The platform uses a **headless CMS approach** where Google Sheets serves as the source of truth:
- **Catalog source**: Published Google Sheet HTML feed fetched dynamically in `market.html`
- **Pricing & inventory**: Sheet ID `2PACX-1vQTTtHAJNH7OCmHvWk6DB8N4t5ddgM74H_P5dcbX4Jq4Glv7Oyy2P08HLiuf6-qu2EwXSIxsfyDC_JZ`
- **Images directory**: `/price_2026/images/` containing product photos named by product code

**Why this architecture?** Content updates via familiar spreadsheet interface without redeploying website.

## Key Data Flows

### 1. **Catalog Loading** (`market.html` + `docs/js/korzina.js`)
```javascript
// market.html fetches and transforms Google Sheet HTML
fetch(SHEETS_HTML_URL) → transformGsheetTable() → injects "Add to Cart" buttons
// Columns: Photo | Code | Name | Description | Price | Spring | Summer | Autumn
```
- Sheet exports HTML with column indices [0-7] for photo, code, name, desc, price, season flags
- `transformGsheetTable()` removes boilerplate columns (1="Раздел", 5="Ссылка") and merges subheaders
- **Critical**: Season columns (5,6,7) contain "да" (yes) indicating product availability
- Images loaded from `/price_2026/images/{code}.jpg` - **code must match exactly**

### 2. **Shopping Cart** (Browser `localStorage`)
```javascript
// korzina.js - cart structure
{
  spring: { CODE1: {photo, name, price, quantity}, ... },
  summer: { CODE2: {...}, ... },
  autumn: { CODE3: {...}, ... }
}
```
- Persists across sessions via `getCart()` / `saveCart()` 
- Seasons map: [5→'spring', 6→'summer', 7→'autumn'] (column indices in Google Sheet)
- Checkout redirects to `/korzina.html` with order form

### 3. **Order Processing** (`korzina.html`)
- Captures customer info (name, email, phone, delivery method)
- Sends via **EmailJS** (`emailjs.init("i3HpqvdgITUgo3iv4")`) to `kodekur@yandex.ru`
- Calls **Upstash Redis counter** to assign sequential order numbers per season per year
- Counter increments: `orderCounter2026spring`, `orderCounter2026summer`, etc.

## Project-Specific Patterns

### Naming Conventions
- **Product codes**: Contain digits; used as filename identifiers (see `CheckDuplicates.gs`)
- **Columns in spreadsheet**:
  - B = Product code (must have digits to be valid)
  - F = Seasonal availability flag ("да" = yes, empty = no)
- **Russian UI language**: All user-facing text in Russian; comments use Russian + English

### Styling Approach
- **Base styles**: `docs/css/style.css` (legacy, uses tables for layout)
- **Catalog/cart styles**: `docs/css/korzina.css` references Google Sheet class selectors (`.waffle .s0` through `.s10`)
- **Color scheme**: Green theme (#99FF99 headers, #449900 nav, #CCFFCC body bg)
- **Responsive**: Desktop-first, minimal mobile optimization

### Static Content Pages
Individual product pages in `docs/mnogoletnije_files/`, `docs/arbustum_files/`, etc. use **Lightbox.js** for image galleries:
```html
<A rel="lightbox[plants]" href="/path/photo.jpg"><IMG src="/path/photo-s.jpg"></A>
```

## Developer Workflows

### **Adding a New Product**
1. Add row to Google Sheet (code must contain digits)
2. Upload image as `/price_2026/images/CODE.jpg` (must match sheet code exactly)
3. Set seasonal availability flags ("да" in columns F/G/H for Spring/Summer/Autumn)
4. Sheet auto-publishes; `market.html` reloads on page refresh

### **Updating Prices/Names**
- Edit Google Sheet → auto-publishes → refresh `market.html` to see changes
- No cache headers on fetch: `{ cache: 'no-store' }`

### **Testing Locally**
```bash
cd /Users/natasha/Documents/GitHub/kodekur/docs
python3 -m http.server 8000
# Visit http://localhost:8000/market.html
# For EmailJS: Disable browser security or configure CORS (see "emailjs security.png")
```

### **Debugging**
- Browser DevTools → Application → localStorage → `cart` → view JSON structure
- Google Sheet URL logged in `market.html`: `const SHEETS_HTML_URL = '...'`
- Upstash counter: Check order prefix (2026spring, 2026summer, 2026autumn)

## Integration Points

- **Google Sheets**: Product source of truth (published as HTML)
- **EmailJS**: Sends order confirmations to `kodekur@yandex.ru`
- **Upstash Redis**: Global order counter (requires auth token)
- **Google CSE**: Site search (configured in `menu.js`)
- **Yandex.Metrika**: Analytics (site ID 41211754)

## Files to Read First

1. `docs/market.html` — Main catalog + cart UI logic
2. `docs/js/korzina.js` — Cart state management
3. `docs/korzina.html` — Order form + EmailJS integration
4. `docs/index.html` — Homepage
5. `docs/**/*.html` except `docs/googleb9c0c66d53ea86db.html` — Static website pages

## Known Quirks & Gotchas

- **Column indices hardcoded**: Changing Google Sheet column order breaks `market.html` (see `cells[1]`, `cells[4]`, `cells[5-7]`)
- **Image caching**: Images in `/price_2026/images/` may be served with browser cache; use `no-store` in fetch if refreshing
- **Russian language dominance**: All business logic uses Russian; variable names mix English/Russian
- **Legacy markup**: HTML uses `<table>` for page layout (pre-CSS Grid era); avoid refactoring without testing all browsers
- **Seasonal shipping**: Products ship during specific windows (Spring: Apr-May, Summer: Jul-Aug, Autumn: Aug-Sep); reflect in UI messages
- **Minimum order**: 2,000 rubles + shipping required to proceed

## Testing Priorities

- [ ] Cart persists across page reloads
- [ ] Product code matches image filename exactly
- [ ] Season columns (5, 6, 7) correctly map to Spring/Summer/Autumn
- [ ] EmailJS sends to `kodekur@yandex.ru` without errors
- [ ] Upstash counter increments and resets per season/year
- [ ] Google Sheet updates reflect on `market.html` within 1 minute
