import React from "react";

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	return <section>{children}</section>;
};

export default DashboardLayout;
