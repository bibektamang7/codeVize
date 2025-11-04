import React from "react";
import { BookOpen, Video, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Resources = () => {
	const resources = [
		{
			title: "Documentation",
			description: "Comprehensive guides and API documentation",
			icon: <BookOpen className="w-6 h-6" />,
			link: "/docs",
		},
		{
			title: "Tutorials",
			description: "Step-by-step tutorials for getting started",
			icon: <Video className="w-6 h-6" />,
			link: "/tutorials",
		},
		{
			title: "Whitepapers",
			description: "In-depth research and industry insights",
			icon: <FileText className="w-6 h-6" />,
			link: "/whitepapers",
		},
		{
			title: "Case Studies",
			description: "Real-world examples of successful implementations",
			icon: <Download className="w-6 h-6" />,
			link: "/case-studies",
		},
	];

	return (
		<div className="min-h-screen bg-black p-8">
			<div className="max-w-6xl mx-auto">
				<Navbar />
				<div className="text-center mb-16 mt-8">
					<h1 className="text-4xl md:text-6xl font-bold mb-4 text-slate-200">
						Resources
					</h1>
					<p className="text-muted-foreground text-lg max-w-2xl mx-auto">
						Explore guides, documentation, and resources to help you get the
						most out of Codevize.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
					{resources.map((resource, index) => (
						<div
							key={index}
							className="bg-gradient-to-b from-[#ffffff05] to-black/50 rounded-xl border border-[#ffffff1a] p-6 hover:border-indigo-500/30 transition-colors"
						>
							<div className="text-indigo-500 mb-4">{resource.icon}</div>
							<h3 className="text-xl font-semibold text-white mb-2">
								{resource.title}
							</h3>
							<p className="text-muted-foreground mb-4">
								{resource.description}
							</p>
							<Button className="w-full text-slate-300 border-white/20 hover:bg-white/10">
								<Link href={resource.link}>Explore</Link>
							</Button>
						</div>
					))}
				</div>

				<div className="bg-gradient-to-b from-[#ffffff05] to-black/50 rounded-2xl border border-[#ffffff1a] p-8 mb-16">
					<h2 className="text-2xl font-bold text-slate-300 mb-4">
						Help Center
					</h2>
					<p className="text-muted-foreground mb-6">
						Find answers to common questions and troubleshoot issues quickly.
					</p>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<Button className="text-slate-300 border-white/20 hover:bg-white/10">
							{/* <Link href="/help/getting-started">Getting Started</Link> */}
							Get Started
						</Button>
						<Button className="text-slate-300 border-white/20 hover:bg-white/10">
							{/* <Link href="/help/integrations">Integrations</Link> */}
							Integrations
						</Button>
						<Button className="text-slate-300 border-white/20 hover:bg-white/10">
							<Link href="/help/troubleshooting">Troubleshooting</Link>
						</Button>
					</div>
				</div>

				<div className="text-center mb-8">
					<Button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3">
						<Link href="/contact">Contact Support</Link>
					</Button>
				</div>
				<Footer />
			</div>
		</div>
	);
};

export default Resources;
