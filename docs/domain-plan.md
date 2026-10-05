# Homepage production and domain plan

Daniel authorized merging and publishing the minimal header and two-card
homepage on Vercel. GitHub is the source repository, not the chosen host.
Do not add a GitHub Pages CNAME or Pages DNS records.

## Dedicated Vercel homepage project

Use the dedicated `dan-personal-homepage` project. Do not modify Dot's proxy
or other applications. Deploy only the exact reviewed `index.html`,
`css/home.css`, and `assets/favicon.svg` from the merged source.
No build, JavaScript runtime, remote fonts, or paid plan is needed.

1. Read project, deployment, domain, and current DNS state before changes.
2. Attach `dandotlee.com` and, if allowed by the integration grant, `www.dandotlee.com`.
3. Use only exact routing and ownership-verification records returned by Vercel.
   Do not guess IPs or CNAME targets.
4. The current task authorizes DNS writes only at apex/www. If Vercel requires
   a verification TXT at another hostname, report that separate authorization
   is needed. A scoped-tool refusal is a blocker, not permission to bypass it.
5. Replace only relevant apex/www web record groups using exact previously
   observed records for compare-and-set. Preserve mail, Dot, Writer, verification,
   nameservers, and every unrelated record. Never purchase or change nameservers.
6. Wait for readiness and TLS; verify the actual HTTPS page and both project links
   in the native browser. A GitHub merge alone is not a deployment.

## Writer and Dot links

The homepage links to `https://dot.dandotlee.com` and the working
`https://writer-dwl285.fly.dev/` address. Writer's custom-domain work is owned
by another worker. Do not modify Writer DNS, deploy Writer, or switch the homepage
link until its custom hostname, TLS, sign-in, and existing note access are verified.

Record deployment ID, exact source SHA, domain/TLS state, and changed DNS groups
privately. Roll back only individual web groups changed, not the whole zone.
Never put credentials or secret values in this repository.
