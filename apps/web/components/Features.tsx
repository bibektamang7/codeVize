import {
	CheckCircle,
	GitBranch,
	Users,
	Zap,
	Code2,
	Shield,
	Clock,
	Workflow,
} from "lucide-react";
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
				<div className="flex h-full w-full bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg" />
			),
			icon: CheckCircle,
			name: "Intelligent Code Reviews",
			background: (
				<img
					src={"/review.png"}
					width={"100%"}
					height={"100%"}
					alt="review image"
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
				<div className="flex h-full w-full bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg" />
			),
			icon: GitBranch,

			background: (
				<img
					src={"/review.png"}
					width={"100%"}
					height={"100%"}
					alt="review image"
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
				<div className="flex h-full w-full bg-gradient-to-br from-secondary/40 to-muted/40 rounded-lg" />
			),
			icon: Users,

			background: (
				<img
					src={"/review.png"}
					width={"100%"}
					height={"100%"}
					alt="review image"
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
				<div className="flex h-full w-full bg-gradient-to-br from-muted/40 to-secondary/40 rounded-lg" />
			),
			icon: Zap,
			background: (
				<img
					src={"/review.png"}
					// width={"100%"}
					// height={"80%"}
					className="inset-0 object-cover"
					alt="review image"
				/>
			),
		},
	];

	return (
		<section className="py-24 px-4 bg-black">
			<div className="max-w-6xl mx-auto">
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-6xl font-bold mb-4 text-white">
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
