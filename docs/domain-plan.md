# Staged domain plan

This repository contains source, not a deployment. No custom-domain configuration,
`CNAME` file, deployment workflow or DNS mutation is included in the homepage PR.
Merging into the existing Pages publishing branch may publish the replacement
homepage, so merge only when that publication is approved.

## Minimal hosting: existing GitHub Pages user site

This is a static site; no new app server, framework, paid plan, or repository is
required. Inspect the actual Pages settings and intended publishing source
(`master`, repository root) before proceeding.

After domain ownership and publication are approved:

1. Export the complete DNS zone. Preserve Dot, nameservers, verification records,
   mail records (MX, SPF, DKIM, DMARC), and all unrelated names.
2. Verify `dandotlee.com` in **account Settings → Pages** with GitHub's generated
   `_github-pages-challenge-dwl285` TXT record. Keep that record after verification.
3. Configure `dandotlee.com` in **repository Settings → Pages → Custom domain**
   before pointing DNS at Pages. Branch publishing creates a root `CNAME` file.
4. Replace only conflicting apex **web A** records with these Pages values:

   | DNS host | Type | Value |
   |---|---|---|
   | `@` | A | `185.199.108.153` |
   | `@` | A | `185.199.109.153` |
   | `@` | A | `185.199.110.153` |
   | `@` | A | `185.199.111.153` |
   | `www` | CNAME | `dwl285.github.io` |

   IPv6 is optional; use GitHub's documented AAAA records if required. Do not
   create an apex CNAME, wildcard record, or change nameservers.
5. Wait for GitHub's DNS and certificate checks, enable **Enforce HTTPS**, then
   verify apex/www behavior, both project links, and unchanged Dot access.

[Official custom-domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
· [Official ownership verification](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)

## Writer custom hostname: later, separately

The homepage must keep `https://writer-dwl285.fly.dev/` until the new hostname is
verified. An authorised operator should inspect the existing Fly app's IPs and
certificate list first, then attach `writer.dandotlee.com` if needed. Use the exact
DNS values returned by Fly, not a guessed CNAME target. No new Writer app or
source deployment is needed solely to attach a hostname.

```sh
fly ips list -a writer-dwl285
fly certs list -a writer-dwl285
# Only after explicit hosting-change approval, if the hostname is not attached:
fly certs add writer.dandotlee.com -a writer-dwl285
fly certs setup writer.dandotlee.com -a writer-dwl285
# After the selected DNS records propagate:
fly certs check writer.dandotlee.com -a writer-dwl285
```

A+AAAA is Fly's recommended direct routing option. For a subdomain CNAME, copy
Fly's unique target from setup output. IPv6, a DNS challenge CNAME, or an ownership
TXT can provide validation; challenge/ownership values must come from Fly.

Confirm the app's allowed origins and the existing Google OAuth client's
Authorized JavaScript origins include the new HTTPS origin while retaining the
working origin. Verify TLS, health, Google sign-in and existing note access on
both hosts, without editing/deleting notes. A new hostname can require a fresh
sign-in. Update the Writer link only in a subsequent reviewed change.

[Official Fly custom-domain guide](https://docs.fly.io/networking/custom-domain)
· [Official Google Identity Services setup](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid)

Record current settings privately before any later change. Roll back only the
individual web records/settings changed; preserve data, existing origins, mail
records and unrelated DNS. Never put credentials or secret values in this repo.
