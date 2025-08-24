import EmptyIssue from "@/pages/EmptyIssue";
import React from "react";

const IssuePage = () => {
	const issues = [];
	return <div>{issues.length !== 0 ? <div></div> : <EmptyIssue />}</div>;
};

export default IssuePage;
