/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow"
          }
        ]
      },
      {
        source: "/:path((?!api/).*)",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "index, follow"
          }
        ]
      }
    ];
  },
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