import Link from "next/link";
import React from "react";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";

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
	return (
		<div className="flex items-center justify-between">
			<h2 className="font-semibold text-lg">CodeVize</h2>
			<div className="flex gap-20 bg-slate-500 px-4 py-2 rounded-md ">
				{navbarList.map((list, index) => (
					<Link
						className="font-semibold"
						key={`${index}-${list.title}`}
						href={list.redirect}
					>
						{list.title}
					</Link>
				))}
			</div>
			<div className="flex items-center gap-4">
				<Button className="bg-inherit">Login</Button>
				<Menu className="md:hidden" />

				<Button className="hidden md:flex">Get Started</Button>
			</div>
		</div>
	);
};

export default Navbar;
