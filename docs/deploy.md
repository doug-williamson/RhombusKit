# Deploying the showcase to rhombuskit.online

The showcase (`apps/showcase`) is a **static, client-side-rendered Angular SPA**
— no SSR, no server runtime. It builds to `dist/apps/showcase/browser/`
(`index.html` + hashed JS/CSS) with `<base href="/">`, so it serves cleanly from
the **apex** domain `rhombuskit.online`.

Hosting: **Cloudflare Pages** (free, private-repo friendly), built from this repo
via Cloudflare's Git integration. DNS is delegated to **Cloudflare**; the domain
stays registered at **Network Solutions**.

> SPA fallback is handled by `apps/showcase/public/_redirects`
> (`/* /index.html 200`), which the build copies to the output root. Without it,
> deep links like `/theming` or `/components/button` 404 on direct load.

---

## 1. Create the Cloudflare Pages project

1. Sign in / sign up at <https://dash.cloudflare.com> (free).
2. **Workers & Pages → Create → Pages → Connect to Git**, authorize GitHub, and
   pick `doug-williamson/RhombusKit`. Production branch: `main`.
3. Build settings:
   | Setting | Value |
   | --- | --- |
   | Framework preset | None |
   | Build command | `pnpm exec nx build showcase` |
   | Build output directory | `dist/apps/showcase/browser` |
   | Root directory | `/` (repo root) |
   - pnpm is auto-selected from the `packageManager` field (`pnpm@11.4.0`) via
     corepack; Cloudflare runs `pnpm install` before the build command.
4. Environment variables (Production **and** Preview):
   | Name | Value |
   | --- | --- |
   | `NODE_VERSION` | `22` |
   - Matches CI. The Angular 21 build needs Node 20.19+/22; the Cloudflare
     default can be older.
5. **Save and Deploy.** First build serves at `https://<project>.pages.dev`.
   Open it and click through `/theming` + a component page, then **refresh** on a
   deep link to confirm the `_redirects` fallback works.

## 2. Delegate DNS to Cloudflare (enables the apex)

The apex `rhombuskit.online` can't use a `CNAME`, and Network Solutions' DNS has
no CNAME-flattening/ALIAS. Cloudflare's nameservers flatten the apex
automatically — so move DNS (not the registration) to Cloudflare.

1. Cloudflare dash → **Add a site** → `rhombuskit.online` → **Free** plan.
   Cloudflare scans existing records; review the imported set (keep any MX/mail
   or other records you rely on).
2. Cloudflare shows **two assigned nameservers**, e.g.
   `xxx.ns.cloudflare.com` / `yyy.ns.cloudflare.com`.
3. In **Network Solutions** (Account Manager → your domain → **Change Where
   Domain Points** / **Manage Name Servers** → *Custom name servers*), replace
   the existing nameservers with the two Cloudflare ones. Save.
   - Network Solutions stays your **registrar**; only DNS resolution moves.
4. Wait for Cloudflare to mark the zone **Active** (often <1 h, can take up to
   24–48 h for NS propagation).

## 3. Attach the custom domain in Pages

Once the zone is Active on Cloudflare:

1. Pages project → **Custom domains → Set up a custom domain** → add
   `rhombuskit.online`. Because DNS is now on Cloudflare, it creates the
   flattened apex record and provisions a TLS cert automatically.
2. Add `www.rhombuskit.online` too, and (optionally) set a redirect so one is
   canonical — e.g. a Cloudflare **Redirect Rule** `www → apex` (301).
3. Wait for the domain status to go **Active** / certificate **Issued**, then
   load `https://rhombuskit.online`.

## Verify

- `https://rhombuskit.online/` loads the homepage over HTTPS.
- Hard-refresh on `https://rhombuskit.online/theming` and
  `https://rhombuskit.online/components/button?tab=api` — both render (no 404).
- The light/dark toggle re-themes the whole page.

## Ongoing

Every push to `main` triggers a Cloudflare Pages production deploy; PRs get
preview URLs. No secrets live in the repo — Cloudflare builds from source.
