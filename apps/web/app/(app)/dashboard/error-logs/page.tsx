import React from "react";
import { getReposWithErrorLogs } from "@/lib/actions";
import { RepositoryProps } from "@/types/model.types";
import ErrorLogsClient from "./ErrorLogsClient";

const ErrorLogsPage = async () => {
	const repos = await getReposWithErrorLogs();

	return <ErrorLogsClient repos={repos} />;
};

export default ErrorLogsPage;
