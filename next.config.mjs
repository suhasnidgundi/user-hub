/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    serverExternalPackages: ["firebase-admin", "@auth/firebase-adapter"],
};

export default nextConfig;