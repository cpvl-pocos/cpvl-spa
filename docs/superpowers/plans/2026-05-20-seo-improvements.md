# CPVL SPA SEO Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a comprehensive SEO framework for the CPVL SPA, correcting the language code, metadata, sitemaps, heading hierarchies, image alt attributes, and establishing dynamic tab and metadata updates using a custom hook with unit tests.

**Architecture:** Create a React 19 native custom hook (`useSEO`) to programmatically handle route metadata dynamically. Integrate this hook into all public pages, realign heading levels (`<h1>` for brand name, `<h2>` for subheadings), fix accessibility image labels, and set up base indexation rules (`robots.txt` and `sitemap.xml`).

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, Vitest, React Testing Library.

---

### Task 1: Core entry HTML and Indexing Assets

**Files:**
- Modify: `index.html`
- Create: `public/robots.txt`
- Create: `public/sitemap.xml`

- [ ] **Step 1: Update index.html**

Update `index.html` to target language `pt-BR`, optimize the base title, and add complete fallback metadata (baseline, Open Graph, and Twitter Cards) for standard search results and link sharing.

Replace the contents of `index.html` with:
```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/icon_cpvl.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- Primary Meta Tags -->
    <title>CPVL - Clube Poços-Caldense de Voo Livre | Parapente e Asa Delta</title>
    <meta name="description" content="Clube Poços-Caldense de Voo Livre (CPVL). Descubra a emoção do parapente e asa delta em Poços de Caldas, MG. Informações sobre pilotos, espaço aéreo, eventos e filiação." />
    <meta name="keywords" content="CPVL, Clube Poços-Caldense de Voo Livre, Voo Livre, Parapente, Asa Delta, Poços de Caldas, Voo Livre Minas Gerais, Rampa de Voo Livre, Voar" />
    <meta name="author" content="CPVL" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://cpvl.com.br" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://cpvl.com.br" />
    <meta property="og:title" content="CPVL - Clube Poços-Caldense de Voo Livre" />
    <meta property="og:description" content="Venha voar em Poços de Caldas! Conheça o CPVL, regulamentos do espaço aéreo, nossa diretoria, e faça sua filiação para praticar parapente e asa delta com segurança." />
    <meta property="og:image" content="https://cpvl.com.br/icon_cpvl.png" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:site_name" content="CPVL" />

    <!-- Twitter -->
    <meta property="twitter:card" content="summary" />
    <meta property="twitter:url" content="https://cpvl.com.br" />
    <meta property="twitter:title" content="CPVL - Clube Poços-Caldense de Voo Livre" />
    <meta property="twitter:description" content="Descubra a emoção do parapente e asa delta em Poços de Caldas, MG. Informações sobre pilotos, espaço aéreo e filiação." />
    <meta property="twitter:image" content="https://cpvl.com.br/icon_cpvl.png" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Create public/robots.txt**

Establish standard search crawl accessibility rules. Allow all public paths, disallow crawl of private dashboard routes, and point to the XML sitemap.

Create `public/robots.txt` with:
```text
User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /dashboard

# Sitemaps
Sitemap: https://cpvl.com.br/sitemap.xml
```

- [ ] **Step 3: Create public/sitemap.xml**

Provide search engines with structured entry points for indexing the main public routes.

Create `public/sitemap.xml` with:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://cpvl.com.br/</loc>
    <lastmod>2026-05-20</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://cpvl.com.br/login</loc>
    <lastmod>2026-05-20</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://cpvl.com.br/signup</loc>
    <lastmod>2026-05-20</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://cpvl.com.br/newpassword</loc>
    <lastmod>2026-05-20</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.1</priority>
  </url>
</urlset>
```

- [ ] **Step 4: Commit Phase 1**

Run:
```bash
git add index.html public/robots.txt public/sitemap.xml
git commit -m "seo: configure pt-BR lang, metadata, robots.txt, and sitemap.xml"
```

---

### Task 2: Custom React 19 Hook for Dynamic SEO

**Files:**
- Create: `src/hooks/useSEO.ts`
- Create: `src/hooks/useSEO.test.tsx`

- [ ] **Step 1: Create the custom hook `src/hooks/useSEO.ts`**

Write a lightweight React 19 native utility that updates browser tab titles and dynamically manages `<meta>` descriptors.

Create `src/hooks/useSEO.ts` with:
```typescript
import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  noindex?: boolean;
}

export const useSEO = ({ title, description, keywords, noindex }: SEOProps) => {
  useEffect(() => {
    // 1. Update Title
    const baseTitle = "CPVL - Clube Poços-Caldense de Voo Livre";
    document.title = title ? `${title} | ${baseTitle}` : baseTitle;

    // 2. Update Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (description) {
      if (!metaDescription) {
        metaDescription = document.createElement("meta");
        metaDescription.setAttribute("name", "description");
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute("content", description);
    }

    // 3. Update Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (keywords) {
      if (!metaKeywords) {
        metaKeywords = document.createElement("meta");
        metaKeywords.setAttribute("name", "keywords");
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute("content", keywords);
    }

    // 4. Update Robots
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (noindex) {
      if (!metaRobots) {
        metaRobots = document.createElement("meta");
        metaRobots.setAttribute("name", "robots");
        document.head.appendChild(metaRobots);
      }
      metaRobots.setAttribute("content", "noindex, nofollow");
    } else if (metaRobots) {
      metaRobots.setAttribute("content", "index, follow");
    }
  }, [title, description, keywords, noindex]);
};
```

- [ ] **Step 2: Write unit test in `src/hooks/useSEO.test.tsx`**

Write a Vitest and React Testing Library spec to thoroughly verify hook behavior.

Create `src/hooks/useSEO.test.tsx` with:
```typescript
import { renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { useSEO } from "./useSEO";

describe("useSEO Hook", () => {
  let initialTitle: string;

  beforeEach(() => {
    initialTitle = document.title;
    document.querySelectorAll("meta[name='description']").forEach(el => el.remove());
    document.querySelectorAll("meta[name='keywords']").forEach(el => el.remove());
    document.querySelectorAll("meta[name='robots']").forEach(el => el.remove());
  });

  afterEach(() => {
    document.title = initialTitle;
  });

  it("should update document.title with brand suffix", () => {
    renderHook(() => useSEO({ title: "Teste" }));
    expect(document.title).toBe("Teste | CPVL - Clube Poços-Caldense de Voo Livre");
  });

  it("should inject or update meta description", () => {
    renderHook(() => useSEO({ title: "Teste", description: "Descrição de Teste" }));
    const meta = document.querySelector("meta[name='description']");
    expect(meta).not.toBeNull();
    expect(meta?.getAttribute("content")).toBe("Descrição de Teste");
  });

  it("should inject or update meta keywords", () => {
    renderHook(() => useSEO({ title: "Teste", keywords: "voo livre, parapente" }));
    const meta = document.querySelector("meta[name='keywords']");
    expect(meta).not.toBeNull();
    expect(meta?.getAttribute("content")).toBe("voo livre, parapente");
  });

  it("should handle noindex robots tag", () => {
    renderHook(() => useSEO({ title: "Teste", noindex: true }));
    const meta = document.querySelector("meta[name='robots']");
    expect(meta).not.toBeNull();
    expect(meta?.getAttribute("content")).toBe("noindex, nofollow");
  });
});
```

- [ ] **Step 3: Run Vitest unit tests**

Run: `npm run test -- --run`
Expected: ALL test cases PASS, including `useSEO.test.tsx` assertions.

- [ ] **Step 4: Commit Phase 2**

Run:
```bash
git add src/hooks/useSEO.ts src/hooks/useSEO.test.tsx
git commit -m "feat: add useSEO custom hook and test suite"
```

---

### Task 3: On-Page Elements & Accessibility in Components

**Files:**
- Modify: `src/components/Hero/Hero.component.tsx`
- Modify: `src/components/Historia/Historia.component.tsx`

- [ ] **Step 1: Fix heading level structure and spelling in `src/components/Hero/Hero.component.tsx`**

Swap heading elements. Wrap "Clube Poços-Caldense de Voo Livre" in an `<h1>` (corrected orthography: "Voo Livre" instead of "Vôo Livre") and represent "Desafios e Conquistas" in a subhead element. Retain exact style strings.

In `src/components/Hero/Hero.component.tsx`, replace:
```tsx
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
        <h4 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-black text-white/80 tracking-tight mb-4 drop-shadow-lg">
          Clube Poçoscaldense de Vôo Livre
        </h4>
        <h1 className="text-lg sm:text-xl text-primary-foreground/80 font-body max-w-2xl drop-shadow">
          Desafios e Conquistas
        </h1>
      </div>
```
With:
```tsx
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-black text-white/80 tracking-tight mb-4 drop-shadow-lg">
          Clube Poços-Caldense de Voo Livre
        </h1>
        <h2 className="text-lg sm:text-xl text-primary-foreground/80 font-body max-w-2xl drop-shadow">
          Desafios e Conquistas
        </h2>
      </div>
```

- [ ] **Step 2: Correct image alternative tag copy-paste in `src/components/Historia/Historia.component.tsx`**

Change image alt tag from `"Diretoria CPVL 2024-2025"` to describing a pilot flying.

In `src/components/Historia/Historia.component.tsx`, replace:
```tsx
            <ScrollReveal delay={150}>
              <div className="my-12">
                <img
                  src={bainaoImage}
                  alt="Diretoria CPVL 2024-2025"
                  className="rounded-xl shadow-lg w-full max-h-80 object-cover"
                />
              </div>
            </ScrollReveal>
```
With:
```tsx
            <ScrollReveal delay={150}>
              <div className="my-12">
                <img
                  src={bainaoImage}
                  alt="Piloto de voo livre decolando ao sul de Poços de Caldas"
                  className="rounded-xl shadow-lg w-full max-h-80 object-cover"
                />
              </div>
            </ScrollReveal>
```

- [ ] **Step 3: Commit Phase 3**

Run:
```bash
git add src/components/Hero/Hero.component.tsx src/components/Historia/Historia.component.tsx
git commit -m "seo: fix heading structure and correct image alt description"
```

---

### Task 4: Dynamic Metadata Integration in Pages

**Files:**
- Modify: `src/pages/Home/Home.component.tsx`
- Modify: `src/pages/login/Login.component.tsx`
- Modify: `src/pages/signup/Signup.component.tsx`
- Modify: `src/pages/Newpassword/Newpassword.component.tsx`
- Modify: `src/pages/NotFound.tsx`

- [ ] **Step 1: Integrate `useSEO` in `src/pages/Home/Home.component.tsx`**

In `src/pages/Home/Home.component.tsx`, add:
```tsx
import { useSEO } from "@/hooks/useSEO";
```
And inside the `Home` component body:
```tsx
  useSEO({
    title: "Início",
    description: "Bem-vindo ao Clube Poços-Caldense de Voo Livre (CPVL). Pratique parapente e asa delta em um dos melhores pontos de voo livre do Brasil.",
    keywords: "CPVL, voo livre, parapente, asa delta, Poços de Caldas, rampas de voo"
  });
```

- [ ] **Step 2: Integrate `useSEO` in `src/pages/login/Login.component.tsx`**

In `src/pages/login/Login.component.tsx`, add the import and call:
```tsx
import { useSEO } from "@/hooks/useSEO";
```
And inside the `Login` component body:
```tsx
  useSEO({
    title: "Login de Associados",
    description: "Área restrita para associados do Clube Poços-Caldense de Voo Livre (CPVL). Acesse seu painel de piloto.",
    noindex: true
  });
```

- [ ] **Step 3: Integrate `useSEO` in `src/pages/signup/Signup.component.tsx`**

In `src/pages/signup/Signup.component.tsx`, add the import and call:
```tsx
import { useSEO } from "@/hooks/useSEO";
```
And inside the `Signup` component body:
```tsx
  useSEO({
    title: "Filiação de Pilotos",
    description: "Faça seu cadastro e filie-se ao Clube Poços-Caldense de Voo Livre (CPVL) para usufruir da melhor infraestrutura aérea.",
    noindex: true
  });
```

- [ ] **Step 4: Integrate `useSEO` in `src/pages/Newpassword/Newpassword.component.tsx`**

In `src/pages/Newpassword/Newpassword.component.tsx`, add the import and call:
```tsx
import { useSEO } from "@/hooks/useSEO";
```
And inside the `Newpassword` component body:
```tsx
  useSEO({
    title: "Recuperar Senha",
    description: "Recupere o acesso à sua conta de piloto no CPVL.",
    noindex: true
  });
```

- [ ] **Step 5: Integrate `useSEO` in `src/pages/NotFound.tsx`**

In `src/pages/NotFound.tsx`, add the import and call:
```tsx
import { useSEO } from "@/hooks/useSEO";
```
And inside the `NotFound` component body:
```tsx
  useSEO({
    title: "Página não Encontrada",
    noindex: true
  });
```

- [ ] **Step 6: Commit Phase 4**

Run:
```bash
git add src/pages/Home/Home.component.tsx src/pages/login/Login.component.tsx src/pages/signup/Signup.component.tsx src/pages/Newpassword/Newpassword.component.tsx src/pages/NotFound.tsx
git commit -m "seo: integrate dynamic useSEO hook into public pages and error pages"
```

---

### Task 5: Production Build Confirmation

**Files:**
- None (Build Validation)

- [ ] **Step 1: Run Vite production compilation**

Run: `npm run build`
Expected: Successful compile and bundle creation without errors.

---
