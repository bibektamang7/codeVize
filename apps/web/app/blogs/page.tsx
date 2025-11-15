import React from "react";
import { Calendar, User, MessageCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Blog = () => {
	const blogPosts = [
		{
			id: 1,
			title: "The Future of AI in Code Review",
			excerpt:
				"Exploring how artificial intelligence is transforming the code review process and improving software quality.",
			date: "May 15, 2024",
			author: "Alex Johnson",
			readTime: "5 min read",
			category: "AI",
		},
		{
			id: 2,
			title: "Best Practices for GitHub Workflow Optimization",
			excerpt:
				"Learn how to streamline your development workflow with automated tools and smart integrations.",
			date: "April 28, 2024",
			author: "Sarah Williams",
			readTime: "8 min read",
			category: "Workflow",
		},
		{
			id: 3,
			title: "Automating Issue Classification with Machine Learning",
			excerpt:
				"Discover how ML algorithms can help categorize and prioritize issues in large-scale projects.",
			date: "April 10, 2024",
			author: "Michael Chen",
			readTime: "6 min read",
			category: "ML",
		},
		{
			id: 4,
			title: "Building a More Efficient Development Team",
			excerpt:
				"Strategies for improving team productivity and collaboration in software development projects.",
			date: "March 22, 2024",
			author: "Emma Rodriguez",
			readTime: "7 min read",
			category: "Team",
		},
	];

	return (
		<div className="min-h-screen bg-black p-8">
			<div className="max-w-6xl mx-auto">
				<Navbar />
				<div className="text-center mb-16 mt-8">
					<h1 className="text-4xl md:text-6xl font-bold mb-4 text-slate-100">
						Blog
					</h1>
					<p className="text-muted-foreground text-lg max-w-2xl mx-auto">
						Insights, tutorials, and stories from the Codevize team and
						community.
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
					<div className="lg:col-span-2">
						<div className="space-y-8">
							{blogPosts.map((post) => (
								<div
									key={post.id}
									className="bg-linear-to-b from-[#ffffff05] to-black/50 rounded-xl border border-[#ffffff1a] p-6 hover:border-indigo-500/30 transition-colors"
								>
									<div className="flex items-center gap-2 mb-3">
										<span className="px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs">
											{post.category}
										</span>
										<span className="text-muted-foreground text-sm">
											{post.readTime}
										</span>
									</div>

									<h2 className="text-2xl font-bold text-slate-300 mb-3">
										{post.title}
									</h2>
									<p className="text-muted-foreground mb-4">{post.excerpt}</p>

									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											<User size={16} />
											<span>{post.author}</span>
											<Calendar size={16} />
											<span>{post.date}</span>
										</div>

										<div className="flex items-center gap-4">
											<button className="flex items-center gap-1 text-muted-foreground hover:text-white">
												<Heart size={16} />
												<span>24</span>
											</button>
											<button className="flex items-center gap-1 text-muted-foreground hover:text-white">
												<MessageCircle size={16} />
												<span>8</span>
											</button>
										</div>
									</div>

									<Button className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-slate-200">
										<Link href={`/blog/${post.id}`}>Read More</Link>
									</Button>
								</div>
							))}
						</div>

						{/* <div className="mt-12 flex justify-center">
              <Button variant="outline" className="bg-black text-white border-white/20 hover:bg-white/10">
                Load More Articles
              </Button>
            </div> */}
					</div>

					<div>
						<div className="bg-linear-to-b from-[#ffffff05] to-black/50 rounded-xl border border-[#ffffff1a] p-6 mb-8">
							<h3 className="text-xl font-bold text-slate-300 mb-4">
								Subscribe to our Newsletter
							</h3>
							<p className="text-muted-foreground mb-4">
								Get the latest posts delivered right to your inbox.
							</p>
							<div className="flex flex-col gap-3">
								<input
									type="email"
									placeholder="Your email address"
									className="bg-[#ffffff08] border border-[#ffffff1a] rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
								/>
								<Button className="bg-indigo-600 hover:bg-indigo-500 text-slate-200">
									Subscribe
								</Button>
							</div>
						</div>

						<div className="bg-linear-to-b from-[#ffffff05] to-black/50 rounded-xl border border-[#ffffff1a] p-6">
							<h3 className="text-xl font-bold text-slate-300 mb-4">
								Popular Categories
							</h3>
							<div className="flex flex-wrap gap-2">
								{[
									"AI",
									"Workflow",
									"ML",
									"Team",
									"Productivity",
									"Tools",
									"Tutorials",
								].map((category, index) => (
									<Button
										key={index}
										className="bg-black capitalize hover:cursor-pointer text-slate-200"
									>
										{category}
									</Button>
								))}
							</div>
						</div>
					</div>
				</div>
				<Footer />
			</div>
		</div>
	);
};

export default Blog;
