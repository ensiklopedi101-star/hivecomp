import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/media-kit", "/kebijakan"],
        disallow: [
          "/admin",
          "/api/",
          "/popbeez",
          "/nusabeez",
          "/blinkbeez",
          "/e-beez",
          "/portal-hub",
          "/blueprint",
          "/studio-logo",
        ],
      },
    ],
    sitemap: "https://www.hivecomp.my.id/sitemap.xml",
  };
}
