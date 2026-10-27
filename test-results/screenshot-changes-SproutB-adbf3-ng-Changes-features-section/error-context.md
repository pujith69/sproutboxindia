# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: screenshot-changes.test.ts >> SproutBox A/B Testing Changes >> features section
- Location: screenshot-changes.test.ts:62:7

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.screenshot: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('#features').first()

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e3]:
    - navigation [ref=e4]:
      - generic [ref=e6]:
        - link "SproutBox" [ref=e7] [cursor=pointer]:
          - /url: /
        - generic [ref=e11]:
          - link "How it works" [ref=e12] [cursor=pointer]:
            - /url: "#how-it-works"
          - link "For Growers" [ref=e13] [cursor=pointer]:
            - /url: "#growers"
          - link "For Restaurants" [ref=e14] [cursor=pointer]:
            - /url: "#restaurants"
        - generic [ref=e15]:
          - link "Sign in" [ref=e16] [cursor=pointer]:
            - /url: /login
          - link "Get Started" [ref=e17] [cursor=pointer]:
            - /url: /register
    - generic [ref=e18]:
      - generic [ref=e20]:
        - generic [ref=e21]: Now onboarding growers & restaurants
        - heading "Farm-to-fork, door to door." [level=1] [ref=e24]: Farm-to-fork,door to door.
        - paragraph [ref=e25]: A demand-driven, decentralized microgreen network — connecting restaurants with home-based growers for the freshest produce, delivered on schedule.
        - generic [ref=e26]:
          - link "Join as Grower" [ref=e27] [cursor=pointer]:
            - /url: /join/grower
          - link "Partner as Restaurant" [ref=e31] [cursor=pointer]:
            - /url: /join/restaurant
        - generic [ref=e32]:
          - paragraph [ref=e33]: Sample dashboard — illustrative preview
          - generic [ref=e34]:
            - generic [ref=e35]:
              - generic [ref=e36]:
                - paragraph [ref=e37]: Active Trays
                - paragraph [ref=e38]: "127"
                - text: +12%
              - generic [ref=e39]:
                - paragraph [ref=e40]: QC Pass Rate
                - paragraph [ref=e41]: 94%
                - text: +3%
              - generic [ref=e42]:
                - paragraph [ref=e43]: Revenue MTD
                - paragraph [ref=e44]: ₹48.5K
                - text: +18%
            - generic [ref=e45]:
              - paragraph [ref=e48]: Mon
              - paragraph [ref=e51]: Tue
              - paragraph [ref=e54]: Wed
              - paragraph [ref=e57]: Thu
              - paragraph [ref=e60]: Fri
              - paragraph [ref=e63]: Sat
              - paragraph [ref=e66]: Sun
      - generic [ref=e68]: Scroll
    - generic [ref=e75]:
      - generic [ref=e76]:
        - generic [ref=e77]: "0"
        - generic [ref=e78]: Microgreen Varieties
      - generic [ref=e80]:
        - generic [ref=e81]: 0-10
        - generic [ref=e83]: Day Grow Cycles
      - generic [ref=e85]:
        - generic [ref=e86]: 0%
        - generic [ref=e88]: Production Buffer
      - generic [ref=e90]:
        - generic [ref=e91]: "0"
        - generic [ref=e92]: Stage Quality Checks
      - generic [ref=e94]:
        - generic [ref=e95]: 0₹+
        - generic [ref=e97]: Per Tray Payout
      - generic [ref=e99]:
        - generic [ref=e100]: "0"
        - generic [ref=e101]: Trays to Start Growing
      - generic [ref=e103]:
        - generic [ref=e104]: "0"
        - generic [ref=e105]: Microgreen Varieties
      - generic [ref=e107]:
        - generic [ref=e108]: 0-10
        - generic [ref=e110]: Day Grow Cycles
      - generic [ref=e112]:
        - generic [ref=e113]: 0%
        - generic [ref=e115]: Production Buffer
      - generic [ref=e117]:
        - generic [ref=e118]: "0"
        - generic [ref=e119]: Stage Quality Checks
      - generic [ref=e121]:
        - generic [ref=e122]: 0₹+
        - generic [ref=e124]: Per Tray Payout
      - generic [ref=e126]:
        - generic [ref=e127]: "0"
        - generic [ref=e128]: Trays to Start Growing
    - generic [ref=e131]:
      - generic [ref=e132]:
        - generic [ref=e133]: The Process
        - heading "Three steps to fresh delivery" [level=2] [ref=e134]
        - paragraph [ref=e135]: From restaurant order to doorstep in 7–10 days
      - generic [ref=e136]:
        - generic [ref=e139]:
          - generic [ref=e140]: "01"
          - generic [ref=e142]: 📦
          - heading "Restaurant Orders" [level=3] [ref=e143]
          - paragraph [ref=e144]: Choose from 6 microgreen varieties. Set quantities, delivery schedule, and recurring preferences — all through a beautiful catalog.
        - generic [ref=e148]:
          - generic [ref=e149]: "02"
          - generic [ref=e151]: 🌱
          - heading "Smart Distribution" [level=3] [ref=e152]
          - paragraph [ref=e153]: Our demand engine converts orders to tray tasks and allocates them to top-rated growers using a score-weighted algorithm.
        - generic [ref=e157]:
          - generic [ref=e158]: "03"
          - generic [ref=e160]: 🚀
          - heading "Quality Delivered" [level=3] [ref=e161]
          - paragraph [ref=e162]: Every harvest is QC-checked with digital + physical inspection. Aggregated at local hubs and delivered fresh to your kitchen.
    - generic [ref=e167]:
      - generic [ref=e168]:
        - generic [ref=e169]: For Growers
        - heading "Turn your space into a micro-farm" [level=2] [ref=e170]
        - generic [ref=e171]:
          - generic [ref=e172]:
            - generic [ref=e173]: 📋
            - generic [ref=e174]:
              - heading "Day-by-day instructions" [level=4] [ref=e175]
              - paragraph [ref=e176]: Guided growing process for every tray, every crop
          - generic [ref=e177]:
            - generic [ref=e178]: 💰
            - generic [ref=e179]:
              - heading "Earn ₹50+ per tray" [level=4] [ref=e180]
              - paragraph [ref=e181]: Consistent income from home, on your schedule
          - generic [ref=e182]:
            - generic [ref=e183]: ⭐
            - generic [ref=e184]:
              - heading "Performance scoring" [level=4] [ref=e185]
              - paragraph [ref=e186]: Build reputation with yield, quality, and timeliness metrics
          - generic [ref=e187]:
            - generic [ref=e188]: 🎯
            - generic [ref=e189]:
              - heading "Start with 5 trays" [level=4] [ref=e190]
              - paragraph [ref=e191]: Low barrier to entry, scale up as you grow
        - link "Start Growing" [ref=e192] [cursor=pointer]:
          - /url: /join/grower
      - generic [ref=e196]:
        - generic [ref=e198]:
          - generic [ref=e199]:
            - generic [ref=e200]: Day 4 of 9
            - generic [ref=e201]: Sunflower Shoots
          - heading "Remove cover, expose to light" [level=4] [ref=e202]
          - paragraph [ref=e203]: Water 150ml. Ensure good airflow around trays.
        - generic [ref=e206]:
          - generic [ref=e207]:
            - paragraph [ref=e208]: Sunflower
            - paragraph [ref=e209]: "5"
            - text: Growing
          - generic [ref=e210]:
            - paragraph [ref=e211]: Pea Shoots
            - paragraph [ref=e212]: "3"
            - text: Sowing
          - generic [ref=e213]:
            - paragraph [ref=e214]: Radish
            - paragraph [ref=e215]: "2"
            - text: Ready
        - generic [ref=e216]:
          - generic [ref=e217]: Est. this week
          - generic [ref=e218]: ₹500
    - generic [ref=e222]:
      - generic [ref=e224]:
        - heading "Crop Catalog" [level=4] [ref=e226]
        - generic [ref=e227]:
          - generic [ref=e228] [cursor=pointer]:
            - generic [ref=e229]: 🌻
            - generic [ref=e230]:
              - paragraph [ref=e231]: Sunflower Shoots
              - paragraph [ref=e232]: 9 days
            - generic [ref=e233]: ₹450/kg
          - generic [ref=e234] [cursor=pointer]:
            - generic [ref=e235]: 🫛
            - generic [ref=e236]:
              - paragraph [ref=e237]: Pea Shoots
              - paragraph [ref=e238]: 8 days
            - generic [ref=e239]: ₹380/kg
          - generic [ref=e240] [cursor=pointer]:
            - generic [ref=e241]: 🌶️
            - generic [ref=e242]:
              - paragraph [ref=e243]: Radish Microgreens
              - paragraph [ref=e244]: 7 days
            - generic [ref=e245]: ₹320/kg
          - generic [ref=e246] [cursor=pointer]:
            - generic [ref=e247]: 🌾
            - generic [ref=e248]:
              - paragraph [ref=e249]: Wheat Grass
              - paragraph [ref=e250]: 10 days
            - generic [ref=e251]: ₹400/kg
          - generic [ref=e252] [cursor=pointer]:
            - generic [ref=e253]: 🌿
            - generic [ref=e254]:
              - paragraph [ref=e255]: Mustard Greens
              - paragraph [ref=e256]: 7 days
            - generic [ref=e257]: ₹350/kg
          - generic [ref=e258] [cursor=pointer]:
            - generic [ref=e259]: 🍃
            - generic [ref=e260]:
              - paragraph [ref=e261]: Fenugreek
              - paragraph [ref=e262]: 8 days
            - generic [ref=e263]: ₹360/kg
      - generic [ref=e264]:
        - generic [ref=e265]: For Restaurants
        - heading "The freshest microgreens, on schedule" [level=2] [ref=e266]: The freshest microgreens,on schedule
        - generic [ref=e267]:
          - generic [ref=e268]:
            - generic [ref=e269]: 🛒
            - generic [ref=e270]:
              - heading "6 varieties, transparent pricing" [level=4] [ref=e271]
              - paragraph [ref=e272]: Per-kg pricing with no hidden costs
          - generic [ref=e273]:
            - generic [ref=e274]: 📡
            - generic [ref=e275]:
              - heading "Real-time order tracking" [level=4] [ref=e276]
              - paragraph [ref=e277]: Track from sowing to delivery on your dashboard
          - generic [ref=e278]:
            - generic [ref=e279]: 🔄
            - generic [ref=e280]:
              - heading "Recurring deliveries" [level=4] [ref=e281]
              - paragraph [ref=e282]: Set up weekly or biweekly auto-orders
          - generic [ref=e283]:
            - generic [ref=e284]: ✅
            - generic [ref=e285]:
              - heading "Quality guaranteed" [level=4] [ref=e286]
              - paragraph [ref=e287]: Multi-stage QC at field, hub, and delivery
        - link "Partner With Us" [ref=e288] [cursor=pointer]:
          - /url: /join/restaurant
    - generic [ref=e293]:
      - generic [ref=e294]:
        - heading "Built on a real system" [level=2] [ref=e295]
        - paragraph [ref=e296]: A demand engine and QC process, not just a pitch
      - generic [ref=e297]:
        - generic [ref=e298]:
          - generic [ref=e299]: 🌱
          - paragraph [ref=e300]:
            - generic [ref=e301]: 0%
          - paragraph [ref=e302]: Production Buffer
          - paragraph [ref=e303]: Built into every plan
        - generic [ref=e304]:
          - generic [ref=e305]: 📊
          - paragraph [ref=e306]: "0"
          - paragraph [ref=e307]: Microgreen Varieties
          - paragraph [ref=e308]: Sunflower to fenugreek
        - generic [ref=e309]:
          - generic [ref=e310]: ✅
          - paragraph [ref=e311]: "0"
          - paragraph [ref=e312]: Stage QC
          - paragraph [ref=e313]: Digital, hub & delivery checks
        - generic [ref=e314]:
          - generic [ref=e315]: ⚡
          - paragraph [ref=e316]: "0"
          - paragraph [ref=e317]: Trays to Start
          - paragraph [ref=e318]: Low barrier grower onboarding
    - generic [ref=e324]:
      - heading "Ready to grow with us?" [level=2] [ref=e325]: Ready to growwith us?
      - paragraph [ref=e326]: Join the microgreen revolution — whether you grow or you order, we've got you covered.
      - generic [ref=e327]:
        - link "Join as Grower" [ref=e328] [cursor=pointer]:
          - /url: /join/grower
        - link "Partner as Restaurant" [ref=e331] [cursor=pointer]:
          - /url: /join/restaurant
    - generic [ref=e333]:
      - generic [ref=e334]:
        - generic [ref=e335]:
          - generic [ref=e336]: SproutBox
          - paragraph [ref=e339]: Demand-driven, decentralized microgreen production and supply platform.
        - generic [ref=e340]:
          - heading "Platform" [level=4] [ref=e341]
          - list [ref=e342]:
            - listitem [ref=e343]:
              - link "How it works" [ref=e344] [cursor=pointer]:
                - /url: "#how-it-works"
            - listitem [ref=e345]:
              - link "For Growers" [ref=e346] [cursor=pointer]:
                - /url: "#for-growers"
            - listitem [ref=e347]:
              - link "For Restaurants" [ref=e348] [cursor=pointer]:
                - /url: "#for-restaurants"
            - listitem [ref=e349]:
              - link "About" [ref=e350] [cursor=pointer]:
                - /url: "#about"
        - generic [ref=e351]:
          - heading "Account" [level=4] [ref=e352]
          - list [ref=e353]:
            - listitem [ref=e354]:
              - link "Sign In" [ref=e355] [cursor=pointer]:
                - /url: /login
            - listitem [ref=e356]:
              - link "Create Account" [ref=e357] [cursor=pointer]:
                - /url: /register
            - listitem [ref=e358]:
              - link "Grower Onboarding" [ref=e359] [cursor=pointer]:
                - /url: /join/grower
            - listitem [ref=e360]:
              - link "Restaurant Onboarding" [ref=e361] [cursor=pointer]:
                - /url: /join/restaurant
      - generic [ref=e362]:
        - paragraph [ref=e363]: © 2026 SproutBox. All rights reserved.
        - paragraph [ref=e364]: Made with 🌱 in India
  - generic [ref=e366]:
    - generic [ref=e372]: Language
    - combobox "Language" [ref=e373] [cursor=pointer]:
      - option "English" [selected]
      - option "ಕನ್ನಡ"
      - option "हिन्दी"
  - alert [ref=e374]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import * as fs from 'fs';
  3   | import * as path from 'path';
  4   | 
  5   | const BASE_URL = 'https://sproutboxindia.vercel.app';
  6   | const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
  7   | 
  8   | // Ensure screenshot directory exists
  9   | if (!fs.existsSync(SCREENSHOT_DIR)) {
  10  |   fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  11  | }
  12  | 
  13  | test.describe.configure({ timeout: 60000 });
  14  | 
  15  | test.describe('SproutBox A/B Testing Changes', () => {
  16  |   test('homepage - full page', async ({ page }) => {
  17  |     await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  18  |     await page.screenshot({
  19  |       path: path.join(SCREENSHOT_DIR, '01-homepage-full.png'),
  20  |       fullPage: true
  21  |     });
  22  |   });
  23  | 
  24  |   test('hero section - control variant', async ({ page }) => {
  25  |     await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  26  |     const hero = page.locator('#hero, section:first-of-type').first();
  27  |     await hero.screenshot({
  28  |       path: path.join(SCREENSHOT_DIR, '02-hero-control.png')
  29  |     });
  30  |   });
  31  | 
  32  |   test('hero section - variant B (forced)', async ({ page }) => {
  33  |     await page.goto(`${BASE_URL}/?sb_force=hero_headline:b`, { waitUntil: 'networkidle' });
  34  |     const hero = page.locator('#hero, section:first-of-type').first();
  35  |     await hero.screenshot({
  36  |       path: path.join(SCREENSHOT_DIR, '03-hero-variant-b.png')
  37  |     });
  38  |   });
  39  | 
  40  |   test('consent banner', async ({ page }) => {
  41  |     // Clear storage to show banner
  42  |     await page.context().clearCookies();
  43  |     await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  44  |     const banner = page.locator('text=We value your privacy').first();
  45  |     if (await banner.isVisible({ timeout: 5000 })) {
  46  |       await banner.screenshot({
  47  |         path: path.join(SCREENSHOT_DIR, '04-consent-banner.png')
  48  |       });
  49  |     } else {
  50  |       console.log('Consent banner not visible (may have been accepted previously)');
  51  |     }
  52  |   });
  53  | 
  54  |   test('footer with language switcher', async ({ page }) => {
  55  |     await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  56  |     const footer = page.locator('footer').first();
  57  |     await footer.screenshot({
  58  |       path: path.join(SCREENSHOT_DIR, '05-footer-language-switcher.png')
  59  |     });
  60  |   });
  61  | 
  62  |   test('features section', async ({ page }) => {
  63  |     await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  64  |     const features = page.locator('#features').first();
> 65  |     await features.screenshot({
      |                    ^ Error: locator.screenshot: Test timeout of 60000ms exceeded.
  66  |       path: path.join(SCREENSHOT_DIR, '06-features-section.png')
  67  |     });
  68  |   });
  69  | 
  70  |   test('benefits section', async ({ page }) => {
  71  |     await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  72  |     const benefits = page.locator('#benefits').first();
  73  |     await benefits.screenshot({
  74  |       path: path.join(SCREENSHOT_DIR, '07-benefits-section.png')
  75  |     });
  76  |   });
  77  | 
  78  |   test('how it works section', async ({ page }) => {
  79  |     await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  80  |     const howItWorks = page.locator('#how-it-works').first();
  81  |     await howItWorks.screenshot({
  82  |       path: path.join(SCREENSHOT_DIR, '08-how-it-works-section.png')
  83  |     });
  84  |   });
  85  | 
  86  |   test('CTA section', async ({ page }) => {
  87  |     await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  88  |     const cta = page.locator('#cta').first();
  89  |     await cta.screenshot({
  90  |       path: path.join(SCREENSHOT_DIR, '09-cta-section.png')
  91  |     });
  92  |   });
  93  | 
  94  |   test('navigation bar', async ({ page }) => {
  95  |     await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  96  |     const nav = page.locator('nav').first();
  97  |     await nav.screenshot({
  98  |       path: path.join(SCREENSHOT_DIR, '10-navbar.png')
  99  |     });
  100 |   });
  101 | 
  102 |   test('problem section', async ({ page }) => {
  103 |     await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  104 |     const problem = page.locator('#problem').first();
  105 |     await problem.screenshot({
  106 |       path: path.join(SCREENSHOT_DIR, '11-problem-section.png')
  107 |     });
  108 |   });
  109 | 
  110 |   test('solution section', async ({ page }) => {
  111 |     await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  112 |     const solution = page.locator('#solution').first();
  113 |     await solution.screenshot({
  114 |       path: path.join(SCREENSHOT_DIR, '12-solution-section.png')
  115 |     });
  116 |   });
  117 | });
```