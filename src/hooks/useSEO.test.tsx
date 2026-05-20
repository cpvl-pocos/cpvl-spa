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
