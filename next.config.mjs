/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/index.html",
        destination: "/",
        permanent: true
      },
      {
        source: "/:path*.html",
        destination: "/:path*",
        permanent: true
      }
    ];
  }
};

export default nextConfig;