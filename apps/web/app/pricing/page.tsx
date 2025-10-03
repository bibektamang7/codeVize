import React from "react";
import Pricing from "@/components/Pricing";
import Navbar from "@/components/Navbar";

const PricingPage = () => {
	return (
		<div className="min-h-screen bg-black text-white">
			<div className="max-w-6xl mx-auto p-8">
				<Navbar />
				<div className="text-center mb-16">
					<h1 className="text-4xl md:text-6xl font-bold mb-4">
						Simple, transparent pricing
					</h1>
					<p className="text-muted-foreground text-lg max-w-2xl mx-auto">
						Choose the plan that fits your team's needs. All plans include our
						core AI-powered features.
					</p>
				</div>

				<Pricing />
			</div>
		</div>
	);
};

export default PricingPage;
