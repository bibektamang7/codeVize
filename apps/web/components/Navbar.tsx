"use client";

import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";

const navbarList = [
	{
		title: "Product",
		redirect: "/products",
	},
	{
		title: "Resources",
		redirect: "/resources",
	},
	{
		title: "Blog",
		redirect: "/blogs",
	},
	{
		title: "Pricing",
		redirect: "/pricing",
	},
];

const Navbar = () => {
	const pathname = usePathname();

	return (
		<header className="flex items-center justify-between px-8 py-6">
			<div className="flex items-center gap-4">
				<div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-md"></div>
				<Link href={"/"} className="font-semibold">Codevize</Link>
			</div>

			<nav className="flex items-center gap-6">
				<ul className="hidden md:flex items-center gap-6 bg-[rgba(255,255,255,0.02)] px-4 py-2 rounded-full">
					{navbarList.map((list) => (
						<li key={list.redirect}>
							<Link
								href={list.redirect}
								className={`px-4 py-1 font-medium ${
									pathname === list.redirect
										? "rounded-full bg-white text-black"
										: "opacity-70 hover:opacity-100"
								}`}
							>
								{list.title}
							</Link>
						</li>
					))}
				</ul>
			</nav>

			<div className="hidden md:flex items-center gap-3">
				<Button className="text-white text-sm opacity-80 bg-inherit hover:cursor-pointer hover:bg-accent">
					<Link href={"/login"}>Login</Link>
				</Button>
				<Button className="text-white/90 bg-indigo-600 hover:cursor-pointer px-4 py-1 rounded-full border-[rgba(255,255,255,0.12)] text-sm hover:bg-indigo-500">
					<Link href={"/signup"}>Sign Up</Link>
				</Button>
			</div>
		</header>
	);
};

export default Navbar;
