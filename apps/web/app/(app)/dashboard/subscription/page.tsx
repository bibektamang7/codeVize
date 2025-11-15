import React from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getAvailablePlans } from "@/lib/actions";
import { subscribeToPlan } from "@/lib/subscription-actions";
import { CheckCircle } from "lucide-react";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import Link from "next/link";

type ExistingPlan = "FREE" | "PRO" | "ENTERPRISE";

interface Plan {
	id: string;
	name: ExistingPlan;
	price: number | null;
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

const SubscriptionPage = async () => {
	const session = await auth();
	const plans = await getAvailablePlans();
	const currentPlan = session?.user?.plan;

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
		<div className="container mx-auto py-10 px-4">
			<div className="text-center mb-12">
				<h1 className="text-3xl md:text-4xl font-bold mb-4">
					Subscription Plans
				</h1>
				<p className="text-muted-foreground max-w-2xl mx-auto">
					Choose the plan that fits your team&apos;s needs. All plans include
					our core AI-powered features.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
				{plans.map((plan: Plan) => {
					const isPopular = plan.name === "PRO";
					const isCurrentPlan = currentPlan === plan.name;

					return (
						<Card
							key={plan.id}
							className={`relative rounded-2xl border ${
								isPopular
									? "border-indigo-500/50 bg-linear-to-b from-indigo-900/10 to-black/80 shadow-lg shadow-indigo-500/20"
									: "border-[#ffffff1a] bg-linear-to-b from-[#ffffff05] to-black/50"
							} flex flex-col`}
						>
							{isPopular && (
								<div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
									<span className="bg-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-full">
										Most Popular
									</span>
								</div>
							)}

							<CardHeader>
								<CardTitle className="text-2xl font-bold">
									{plan.name}
								</CardTitle>
								<div className="mt-2">
									{plan.price !== null ? (
										<>
											<span className="text-4xl font-bold">
												Rs {plan.price}
											</span>
											<span className="text-muted-foreground">/month</span>
										</>
									) : (
										<span className="text-4xl font-bold">Free</span>
									)}
								</div>
								<CardDescription className="mt-2">
									{plan.description}
								</CardDescription>
							</CardHeader>

							<CardContent className="flex-1">
								<div className="mb-6">
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
							</CardContent>

							<CardFooter className="flex-col">
								{isCurrentPlan ? (
									<Button
										className="w-full bg-green-600 hover:bg-green-500 text-white"
										disabled
									>
										Current Plan
									</Button>
								) : (
									<form
										action={async () => {
											"use server";
											await subscribeToPlan(plan.name);
										}}
									>
										<Button
											className={`w-full hover:cursor-pointer ${
												isPopular
													? "bg-indigo-600 hover:bg-indigo-500 text-white"
													: "bg-white/10 hover:bg-white/20 text-white border border-white/10"
											}`}
											type="submit"
										>
											Upgrade to {plan.name}
										</Button>
									</form>
								)}

								{plan.price && plan.price > 0 ? (
									<p className="text-xs text-muted-foreground mt-2">
										You will be redirected to a secure payment gateway
									</p>
								) : (
									<p></p>
								)}
							</CardFooter>
						</Card>
					);
				})}
			</div>

			<div className="mt-12 text-center max-w-2xl mx-auto">
				<h3 className="text-xl font-semibold mb-2">
					Need Enterprise Features?
				</h3>
				<p className="text-muted-foreground mb-4">
					Contact us for custom solutions, priority support, and advanced
					security features.
				</p>
				<Link
					href="/contact"
					className="inline-block"
				>
					<Button variant="outline">Contact Sales</Button>
				</Link>
			</div>
		</div>
	);
};

export default SubscriptionPage;
