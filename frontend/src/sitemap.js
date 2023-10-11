const sitemap = require("sitemap");
const fs = require("fs");

const hostname = "https://www.ramsaysdetailing.ca";

const urls = [
  { url: "/", changefreq: "daily", priority: 1 },
  { url: "/about", changefreq: "monthly", priority: 0.8 },
  { url: "/services", changefreq: "monthly", priority: 0.8 },
  // Add additional pages here
];

const sitemapInstance = sitemap.createSitemap({
  hostname,
  urls,
});

const sitemapXml = sitemapInstance.toString();

fs.writeFile("./public/sitemap.xml", sitemapXml, (err) => {
  if (err) {
    console.error("Error writing sitemap.xml:", err);
  } else {
    console.log("Sitemap.xml generated successfully!");
  }
});
