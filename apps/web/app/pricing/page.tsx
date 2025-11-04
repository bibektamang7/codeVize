import React from "react";
import Pricing from "@/components/Pricing";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PricingPage = () => {
	return (
		<div className="min-h-screen bg-black">
			<div className="max-w-6xl mx-auto p-8">
				<Navbar />
				<Pricing />
				<Footer />
			</div>
		</div>
	);
};

export default PricingPage;
