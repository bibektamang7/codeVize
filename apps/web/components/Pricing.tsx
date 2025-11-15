import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ExistingPlan = "FREE" | "PRO" | "ENTERPRISE";

interface Plan {
	name: ExistingPlan;
	price: number;
	maxRepos: number;
	aiReviewEnabled: boolean;
	aiIssueTriageEnabled: boolean;
	issueEmbedEnabled: boolean;
	pathConfigCustomization: boolean;
	labelConfigCustomization: boolean;
	embeddingRepoContext: boolean;
	maxRepoIssueEmbedding: number;
	maxMonthlyReview: number;
	description: string;
}

const Pricing = () => {
	const plans: Plan[] = [
		{
			name: "FREE" as ExistingPlan,
			price: 0,
			maxRepos: 3,
			aiReviewEnabled: true,
			aiIssueTriageEnabled: true,
			issueEmbedEnabled: false,
			pathConfigCustomization: false,
			labelConfigCustomization: false,
			embeddingRepoContext: false,
			maxRepoIssueEmbedding: 0,
			maxMonthlyReview: 50,
			description:
				"Perfect for individuals getting started with AI code review.",
		},
		{
			name: "PRO" as ExistingPlan,
			price: 199,
			maxRepos: 10,
			aiReviewEnabled: true,
			aiIssueTriageEnabled: true,
			issueEmbedEnabled: true,
			pathConfigCustomization: true,
			labelConfigCustomization: true,
			embeddingRepoContext: true,
			maxRepoIssueEmbedding: 200,
			maxMonthlyReview: 500,
			description:
				"Best for small teams needing deeper AI context and automation.",
		},
		{
			name: "ENTERPRISE" as ExistingPlan,
			price: 699,
			maxRepos: 50,
			aiReviewEnabled: true,
			aiIssueTriageEnabled: true,
			issueEmbedEnabled: true,
			pathConfigCustomization: true,
			labelConfigCustomization: true,
			embeddingRepoContext: true,
			maxRepoIssueEmbedding: 1000,
			maxMonthlyReview: 5000,
			description:
				"For organizations needing scalable and secure AI integrations.",
		},
	];

	const getFeaturesForPlan = (plan: Plan) => {
		const features = [];

		if (plan.aiReviewEnabled) features.push("AI Code Reviews");
		if (plan.aiIssueTriageEnabled) features.push("AI Issue Triage");
		if (plan.issueEmbedEnabled) features.push("Issue Embedding");
		if (plan.pathConfigCustomization)
			features.push("Path Configuration Customization");
		if (plan.labelConfigCustomization)
			features.push("Label Configuration Customization");
		if (plan.embeddingRepoContext)
			features.push("Repository Context Embedding");
		if (plan.maxRepoIssueEmbedding > 0)
			features.push(
				`${plan.maxRepoIssueEmbedding} Issue Embeddings per Repository`
			);
		features.push(`${plan.maxMonthlyReview} Monthly Reviews`);
		features.push(`${plan.maxRepos} Active Repositories`);

		return features;
	};

	return (
		<section className="py-20 px-4 bg-linear-to-b from-black to-[#0a0a0a]">
			<div className="max-w-6xl mx-auto">
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-200">
						Simple, transparent pricing
					</h2>
					<p className="text-muted-foreground max-w-2xl mx-auto">
						Choose the plan that fits your team&apos;s needs. All plans include
						our core AI-powered features.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{plans.map((plan) => {
						const planId = plan.name.toLowerCase();
						const isPopular = plan.name === "PRO";

						return (
							<div
								key={planId}
								className={`relative rounded-2xl border ${
									isPopular
										? "border-indigo-500/50 bg-linear-to-b from-indigo-900/10 to-black/80 shadow-lg shadow-indigo-500/20"
										: "border-[#ffffff1a] bg-linear-to-b from-[#ffffff05] to-black/50"
								} p-6 flex flex-col`}
							>
								{isPopular && (
									<div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
										<span className="bg-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-full">
											Most Popular
										</span>
									</div>
								)}

								<div className="mt-6">
									<h3 className="text-xl font-bold text-slate-200">
										{plan.name}
									</h3>
									<div className="mt-4">
										<span className="text-3xl font-bold text-slate-200">
											RS. {plan.price}
										</span>
										<span className="text-muted-foreground">/month</span>
									</div>
									<p className="mt-2 text-muted-foreground text-sm">
										{plan.description}
									</p>

									<div className="my-6">
										<div className="text-muted-foreground text-sm mb-2">
											Up to{" "}
											<span className="text-white font-medium">
												{plan.maxRepos}
											</span>{" "}
											active repositories
										</div>
									</div>

									<ul className="space-y-3 flex-1">
										{getFeaturesForPlan(plan).map((feature, featureIndex) => (
											<li
												key={featureIndex}
												className="flex items-start gap-2"
											>
												<CheckCircle
													className="text-green-500 mt-0.5 shrink-0"
													size={18}
												/>
												<span className="text-muted-foreground text-sm">
													{feature}
												</span>
											</li>
										))}
									</ul>

									<Button
										className={`w-full mt-8 ${
											isPopular
												? "bg-indigo-600 hover:bg-indigo-500 text-white"
												: "bg-white/10 hover:bg-white/20 text-white border border-white/10"
										}`}
									>
										Get Started
									</Button>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default Pricing;
