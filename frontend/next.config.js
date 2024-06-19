/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: "/frontend",
  i18n: {
    locales: ['default', 'en', 'zh-CN'],
    defaultLocale: 'default',
  },
};

module.exports = nextConfig;
