import { CheckCircle, GitBranch, Users, Zap } from "lucide-react";
import { BentoGrid, BentoCard } from "@/components/magicui/bento-grid";
import Image from "next/image";

const Features = () => {
	const features = [
		{
			className: "md:col-span-2",
			title: "Intelligent Code Reviews",
			description:
				"AI-powered analysis that understands your codebase context and provides meaningful suggestions for improvement.",
			header: (
				<div className="flex h-full w-full bg-linear-to-br from-primary/20 to-accent/20 rounded-lg" />
			),
			icon: CheckCircle,
			name: "Intelligent Code Reviews",
			background: (
				<Image
					src={"/review.webp"}
					width={500}
					height={400}
					className="w-full h-50 inset-0 object-cover  opacity-90"
					alt="review image"
					loading="lazy"
				/>
			),
		},
		{
			name: "Smart Issue Tagging",
			className: "md:col-span-1",
			title: "Smart Issue Tagging",
			description:
				"Automatically categorize and label issues based on content analysis and historical patterns.",
			header: (
				<div className="flex h-full w-full bg-linear-to-br from-accent/20 to-primary/20 rounded-lg" />
			),
			icon: GitBranch,

			background: (
				<Image
					src={"/summary.webp"}
					width={1000}
					height={1000}
					className="inset-0 object-cover  w-full h-full opacity-90"
					alt="summary image"
					loading="lazy"
				/>
			),
		},
		{
			name: "Team Collaboration",
			className: "md:col-span-1",
			title: "Team Collaboration",
			description:
				"Enhanced coordination with smart notifications and review assignment algorithms.",
			header: (
				<div className="flex h-full w-full bg-linear-to-br from-secondary/40 to-muted/40 rounded-lg" />
			),
			icon: Users,

			background: (
				<Image
					src={"/team.webp"}
					width={1000}
					height={1000}
					className="inset-0 object-cover w-full h-full opacity-90"
					alt="team collaboration image"
					loading="lazy"
				/>
			),
		},
		{
			name: "Lightning Fast Performance",
			className: "md:col-span-2",
			title: "Lightning Fast Performance",
			description:
				"Instant analysis and tagging that seamlessly integrates with your development velocity and workflow.",
			header: (
				<div className="flex h-full w-full bg-linear-to-br from-muted/40 to-secondary/40 rounded-lg" />
			),
			icon: Zap,
			background: (
				<Image
					src={"/fast.webp"}
					height={1000}
					width={1000}
					className=" object-contain w-full h-50 opacity-90"
					alt="performance image"
					loading="lazy"
				/>
			),
		},
	];

	return (
		<section className="py-24 px-4 bg-black">
			<div className="max-w-6xl mx-auto">
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-6xl font-bold mb-4 text-gray-200">
						Everything you need to optimize your GitHub workflow
					</h2>
					<p className=" text-muted-foreground max-w-2xl mx-auto">
						Codevize integrates seamlessly with GitHub to provide intelligent
						code reviews and automated issue management.
					</p>
				</div>

				<BentoGrid className="max-w-4xl mx-auto">
					{features.map((feature, index) => (
						<BentoCard
							key={index}
							title={feature.title}
							description={feature.description}
							Icon={feature.icon}
							className={feature.className}
							name={feature.name}
							background={feature.background}
							href={""}
							cta={""}
						/>
					))}
				</BentoGrid>
			</div>
		</section>
	);
};

export default Features;
