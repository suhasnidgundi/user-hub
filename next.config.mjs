/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    experimental: {
        serverComponentsExternalPackages: ["firebase-admin", "@auth/firebase-adapter"],
    },
};

export default nextConfig;