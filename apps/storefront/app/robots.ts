import type { MetadataRoute } from "next";

const BASE_URL = "https://infra-pro.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/admin/",
          "/checkout",
          "/cart",
          "/login",
          "/register",
          "/forgot-password",
          "/account/",
          "/orders/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/admin/",
          "/checkout",
          "/cart",
          "/login",
          "/register",
          "/forgot-password",
          "/account/",
          "/orders/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
