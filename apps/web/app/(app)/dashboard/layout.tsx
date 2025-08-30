import DashboardHeader from "@/components/DashboardHeader";
import React from "react";

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	return (
		<section className="bg-black text-white min-h-screen w-max-screen w-full overflow-hidden relative">
			<DashboardHeader />
			{children}
		</section>
	);
};

export default DashboardLayout;
