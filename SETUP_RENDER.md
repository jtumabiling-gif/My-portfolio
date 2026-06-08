# Deploying this Portfolio to Render.com

This document explains how to deploy your static portfolio site to Render (render.com). It includes: a quick manual setup, an automated (render.yaml) configuration, and tips for custom domains and continuous deploys.

---

## Prerequisites

- A Render account (https://render.com). Sign up or log in.
- Your project pushed to a Git provider supported by Render (GitHub, GitLab, or Bitbucket). This repo should contain `index.html` at the repository root (no additional build step required).
- Access to the repository (Render will ask you to grant access when connecting).

---

## Quick Manual Setup (recommended for first-time deploy)

1. Go to https://dashboard.render.com and click **New +** → **Static Site**.
2. Connect your Git provider (GitHub recommended) and authorize Render to access your repository.
3. Select your repository (for example `jtumabiling-gif/My-portfolio`) and choose the branch you want to deploy (e.g. `main`).
4. Build Command: leave empty (this is a plain static site). If you later add a build step (e.g. a toolchain), set the appropriate command here (for example `npm run build`).
5. Publish Directory: `/` (root) — since `index.html` is in the repository root.
6. Name: give it a friendly name (e.g. `john-wyne-portfolio`). Choose the free plan if prompted.
7. Click **Create Static Site**. Render will start the first build and give you a unique subdomain like `your-name.onrender.com`.
8. After deploy completes, visit the provided `.onrender.com` URL to preview.

Notes:
- Any push to the selected branch (e.g. `main`) will trigger a new deploy automatically.
- If your assets are in `assets/` (as in this repo), they will be served relative to the root paths referenced in `index.html`.

---

## Deploy with `render.yaml` (Infrastructure as Code)

You can add a `render.yaml` file to the repository so Render can create/update the static site automatically when you import the repo into Render or when you use the Dashboard's "Import from YAML" feature.

Create a file named `render.yaml` at the repo root with this content:

```yaml
services:
  - type: static_site
    name: my-portfolio
    env: static
    plan: free
    repo: jtumabiling-gif/My-portfolio  # replace with your GitHub owner/repo
    branch: main
    buildCommand: ""                   # empty for plain static HTML
    publishPath: "/"                   # root of repo where index.html lives
```

How to use the YAML:
- Add and commit `render.yaml` to your repo and push.
- In Render dashboard choose **New + → Import from GitHub** then import by repository. Render will detect `render.yaml` and pre-fill the service. Confirm and create the service.

---

## Custom Domain & HTTPS

1. In your service settings on Render, go to the **Custom Domains** tab.
2. Add your domain (`example.com` or `www.example.com`).
3. Render will show DNS records to add at your DNS provider (usually an ALIAS / A record for root or a CNAME for `www`).
4. Add the recommended records in your DNS provider and wait for propagation.
5. Render will automatically provision a TLS certificate (Let's Encrypt) once DNS is verified.

Tip: if you use a root domain, prefer an ALIAS/ANAME or `A` records that your DNS provider supports. For `www` use a CNAME to the Render service domain.

---

## Continuous Deployment

- Every push to the configured branch will automatically trigger a new deploy.
- You can configure environment variables in Render (Settings → Environment) if you later add server-side features or forms that need keys.

---

## Contact Form / Server-backed Features

This portfolio includes a client-side contact form that currently simulates sending. If you want to receive messages:

- Use a serverless form endpoint like Formspree, Getform, or Netlify Forms and update the form's `action`/JS.
- Or deploy a small API (Render supports web services) and set the contact form to POST to that API.

If you want, I can add instructions to wire a Formspree/Email endpoint and store the API key in Render's environment variables.

---

## Troubleshooting

- Build fails: check `buildCommand`. For plain HTML leave blank; for frameworks add the correct command and adjust `publishPath`.
- Assets missing: verify asset paths in `index.html` are relative (e.g. `assets/img/...`).
- Not picking up `render.yaml`: make sure file is at repo root and valid YAML; re-import the repository in Render.

---

## Example: Quick Local Test Before Push

Open `index.html` locally to sanity check paths:

Windows PowerShell:

```powershell
Start-Process .\index.html
```

Or run a tiny static server (Python):

```powershell
# in project root
python -m http.server 8000
# then visit http://localhost:8000
```

---

If you'd like, I can:
- Add `render.yaml` to your repo with the correct `repo:` value, or
- Wire a Formspree contact form and add instructions for storing the API key in Render.

Tell me which and I'll update the repository accordingly.
