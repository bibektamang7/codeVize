import nextBundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = nextBundleAnalyzer({
	enabled: false,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
	eslint: {
		ignoreDuringBuilds: false,
	},
	experimental: {
		optimizePackageImports: ["lucide-react"],
		serverActions: {
			allowedOrigins: ["jxvswcg0-3000.inc1.devtunnels.ms", "localhost:3000"]
		}
	},
	images: {
		remotePatterns: [
			{
				hostname: "avatars.githubusercontent.com",
			},
		],
	},
};

export default withBundleAnalyzer(nextConfig);
