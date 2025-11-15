import { Github, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
	return (
		<footer className="border-t border-[#ffffff1a] bg-black">
			<div className="max-w-6xl mx-auto px-4 py-12">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					<div>
						<h3 className="text-xl font-semibold text-white mb-4">Codevize</h3>
						<p className="text-muted-foreground text-sm">
							AI-powered GitHub PR reviews and issue tagging to streamline your
							development workflow.
						</p>
						<div className="flex space-x-4 mt-4">
							<Button
								variant="ghost"
								size="icon"
								className="text-muted-foreground hover:text-white"
							>
								<Github className="h-5 w-5" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="text-muted-foreground hover:text-white"
							>
								<Twitter className="h-5 w-5" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="text-muted-foreground hover:text-white"
							>
								<Linkedin className="h-5 w-5" />
							</Button>
						</div>
					</div>

					<div>
						<h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
							Product
						</h4>
						<ul className="space-y-2">
							<li>
								<a
									href="/product"
									className="text-muted-foreground hover:text-white text-sm"
								>
									Features
								</a>
							</li>
							<li>
								<a
									href="/pricing"
									className="text-muted-foreground hover:text-white text-sm"
								>
									Pricing
								</a>
							</li>
						</ul>
					</div>

					<div>
						<h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
							Company
						</h4>
						<ul className="space-y-2">
							<li>
								<a
									href="#"
									className="text-muted-foreground hover:text-white text-sm"
								>
									About
								</a>
							</li>
							<li>
								<a
									href="/blog"
									className="text-muted-foreground hover:text-white text-sm"
								>
									Blog
								</a>
							</li>
							<li>
								<a
									href="#"
									className="text-muted-foreground hover:text-white text-sm"
								>
									Careers
								</a>
							</li>
							<li>
								<a
									href="#"
									className="text-muted-foreground hover:text-white text-sm"
								>
									Contact
								</a>
							</li>
						</ul>
					</div>

					<div>
						<h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
							Support
						</h4>
						<ul className="space-y-2">
							<li>
								<a
									href="#"
									className="text-muted-foreground hover:text-white text-sm"
								>
									Documentation
								</a>
							</li>
							<li>
								<a
									href="#"
									className="text-muted-foreground hover:text-white text-sm"
								>
									API Status
								</a>
							</li>
							<li>
								<a
									href="#"
									className="text-muted-foreground hover:text-white text-sm"
								>
									Help Center
								</a>
							</li>
							<li>
								<a
									href="#"
									className="text-muted-foreground hover:text-white text-sm"
								>
									Community
								</a>
							</li>
						</ul>
					</div>
				</div>

				<div className="border-t border-[#ffffff1a] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
					<p className="text-muted-foreground text-sm">
						© {new Date().getFullYear()} Codevize. All rights reserved.
					</p>
					<div className="flex space-x-6 mt-4 md:mt-0">
						<a
							href="#"
							className="text-muted-foreground hover:text-white text-sm"
						>
							Privacy Policy
						</a>
						<a
							href="#"
							className="text-muted-foreground hover:text-white text-sm"
						>
							Terms of Service
						</a>
						<a
							href="#"
							className="text-muted-foreground hover:text-white text-sm"
						>
							Cookies
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
