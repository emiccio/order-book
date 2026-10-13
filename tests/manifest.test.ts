import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

describe("manifest.webmanifest", () => {
  const manifest = JSON.parse(
    readFileSync(path.resolve(__dirname, "../public/manifest.webmanifest"), "utf-8"),
  );

  it("declara nombre", () => {
    expect(manifest.name).toBe("Libreta de Ventas");
  });

  it("declara display standalone", () => {
    expect(manifest.display).toBe("standalone");
  });

  it("declara start_url y scope en /app", () => {
    expect(manifest.start_url).toBe("/app");
    expect(manifest.scope).toBe("/app");
  });

  it("declara íconos de 192 y 512", () => {
    const sizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
  });
});
