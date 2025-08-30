import { RepositoryProps } from "@/types/model.types";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_URL;
console.log("thisis bakcend url", backendBaseURL);

export const useGetRepositories = () => {
	const { data } = useSession();
	console.log("thisi is dat",data)
	const [repos, setRepos] = useState<RepositoryProps[]>([]);
	const fetchRepositories = async () => {
		const response = await axios.get(`${backendBaseURL}/users/repositories`, {
			headers: {
				Authorization: `Bearer ${data?.accessToken}`,
			},
		});
		if (response.status !== 200) {
			console.error("failed to fetch repositories", response.data);
			return;
		}
		console.log("this is repositories", response.data);
	};
	useEffect(() => {
		fetchRepositories();
	});
	return { repos };
};
