import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/learn", "/api", "/signin", "/signup"],
    },
    sitemap: "https://raelearn.byraeform.com/sitemap.xml",
  };
}
