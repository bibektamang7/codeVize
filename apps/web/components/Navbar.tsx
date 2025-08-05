import Link from "next/link";
import React from "react";
import { Menu } from "lucide-react";

const navbarList = [
	{
		title: "Product",
		redirect: "/products",
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
			{/* <div className="flex gap-4 ">
				{navbarList.map((list, index) => (
					<Link
						className="text-slate-700 font-semibold"
						key={`${index}-${list.title}`}
						href={list.redirect}
					>
						{list.title}
					</Link>
				))}
			</div>
			<div>
				<button>Login</button>
			</div> */}
			<div>
				<Menu />
			</div>
		</div>
	);
};

export default Navbar;
