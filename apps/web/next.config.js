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
	},
};

export default withBundleAnalyzer(nextConfig);
