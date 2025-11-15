import React from "react";
import dynamic from "next/dynamic";
const Features = dynamic(() => import("@/components/Features"));
const Landing = dynamic(() => import("@/components/Landing"));
const Pricing = dynamic(() => import("@/components/Pricing"));
const Testimonials = dynamic(() => import("@/components/Testimonials"));
const FAQ = dynamic(() => import("@/components/FAQ"));
const Footer = dynamic(() => import("@/components/Footer"));

const Home = () => {
	return (
		<div className="dark">
			<Landing />
			<Features />
			<Pricing />
			<Testimonials />
			<FAQ />
			<Footer />
		</div>
	);
};

export default Home;
