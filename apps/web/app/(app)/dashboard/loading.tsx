import LoaderComponent from "@/components/Loader";
import React from "react";

const loading = () => {
	return (
		<div className="w-full h-screen">
			<LoaderComponent />
		</div>
	);
};

export default loading;
