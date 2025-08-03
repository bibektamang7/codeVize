"use client";

import React, { useCallback } from "react";
import { Button } from "./ui/button";
import { signIn } from "next-auth/react";

const AuthButton = ({ type }: { type: string }) => {
	const handleAuth = async () => {
		try {
			await signIn("github", { redirectTo: "/dashboard" });
		} catch (error) {
			console.log(error);
		}
	};
	return (
		<Button
			onClick={handleAuth}
			className="hover:cursor-pointer w-full flex items-center gap-2 h-12 bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="currentColor"
				viewBox="0 0 24 24"
				width="24"
				height="24"
				className="h-5 w-5"
			>
				<path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.207 11.387.6.112.793-.262.793-.582 0-.287-.011-1.244-.017-2.255-3.338.725-4.042-1.612-4.042-1.612-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.082-.729.082-.729 1.205.084 1.839 1.238 1.839 1.238 1.07 1.834 2.809 1.304 3.495.997.108-.775.419-1.305.762-1.605-2.665-.304-5.466-1.332-5.466-5.932 0-1.31.469-2.381 1.236-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 3.003-.403c1.02.005 2.047.137 3.003.403 2.29-1.552 3.295-1.23 3.295-1.23.655 1.653.243 2.874.119 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.804 5.625-5.475 5.921.43.37.823 1.102.823 2.222 0 1.604-.015 2.896-.015 3.293 0 .323.192.698.8.58C20.565 21.796 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
			</svg>
			{type} with GitHub
		</Button>
	);
};

export default AuthButton;
