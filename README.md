# Daniel's project homepage

A static, responsive homepage for **dandotlee.com**, in the existing user-site
repository. Links to Dot and Writer; does not change either application.

## Design and scope

- Plain HTML and CSS; no runtime JavaScript, framework, tracking, remote fonts,
  or large image downloads. The three homepage assets total less than 10 KB.
- Uses Dot's paper/green/ink palette and Writer's warm gold/serif treatment.
  Writer's existing SVG mark is reused inline from `dwl285/writer/public/favicon.svg`.
- Semantic landmarks, keyboard skip link, visible focus rings, 44+ px project
  link targets, responsive single-column layout, forced-color and reduced-motion support.
- Copy describes the projects, not unverified biographical or professional claims.
- Writer intentionally links to `https://writer-dwl285.fly.dev/` until its custom
  hostname, TLS, Google sign-in, and note access have been verified.

The old `pages/`, images, jQuery, Sass, and `css/main.css` remain unchanged for
legacy URLs. The new homepage loads only `css/home.css` and its small SVG favicon.
No `CNAME`, deployment workflow, hosting configuration, or DNS changes are included.

## Preview and checks

Requires Python 3 and Node.js 24+ for the development checks, not for production.

```sh
npm ci
npx playwright install chromium
npm test
npm run preview
```

Preview runs on port 4173. The tests start a server automatically when needed.
They check destinations, keyboard navigation/activation, no third-party asset
requests, JavaScript-disabled rendering, a 20 KB asset budget, responsive layouts
and axe accessibility scans at 320, 390, 640, 768, and 1440 px, and 200% text
resizing with forced colors and reduced motion. Automated scans are not a complete
accessibility certification; manual keyboard and visual review are still needed.

There is no build step. Production hosting is Vercel, in the dedicated
`dan-personal-homepage` project, not GitHub Pages. Publish only the three homepage
assets; keep development checks and legacy files out of the deployment.
See [the domain plan](docs/domain-plan.md).
