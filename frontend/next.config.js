const withMDX = require("@next/mdx")({
  // extension: /\.mdx?$/, // not using mdx parser.
  options: {
    remarkPlugins: [
      require("remark-prism"),
      {
        plugins: []
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: "/frontend",
  pageExtensions: ["js", "jsx", "ts", "tsx", "mdx"],
  i18n: {
    locales: ["default", "en", "zh-CN"],
    defaultLocale: "default",
  },
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.md$/,
      use: [
        {
          loader: "raw-loader", // parse to string
        },
      ],
    });
    return config;
  },
};

module.exports = withMDX(nextConfig);
