import { ExistingPlan } from "@prisma/client";
import { prisma } from "../src/prismaClient";

async function main() {
	const plans = [
		{
			name: ExistingPlan.FREE,
			price: 0,
			maxRepos: 3,
			aiReviewEnabled: true,
			aiIssueTriageEnabled: true,
			maxRepoIssueEmbedding: 0,
			issueEmbedEnabled: false,
			pathConfigCustomization: false,
			labelConfigCustomization: false,
			embeddingRepoContext: false,
			maxMonthlyReview: 50,
			description:
				"Perfect for individauls getting started with AI code review.",
		},
		{
			name: ExistingPlan.PRO,
			price: 199,
			maxRepos: 10,
			aiReviewEnabled: true,
			aiIssueTriageEnabled: true,
			maxRepoIssueEmbedding: 200,
			issueEmbedEnabled: true,
			pathConfigCustomization: true,
			labelConfigCustomization: true,
			embeddingRepoContext: true,
			maxMonthlyReview: 500,
			description:
				"Best for small teams needing deeper AI context and automation.",
		},
		{
			name: ExistingPlan.ENTERPRISE,
			price: 699,
			maxRepos: 50,
			aiReviewEnabled: true,
			aiIssueTriageEnabled: true,
			maxRepoIssueEmbedding: 1000,
			issueEmbedEnabled: true,
			pathConfigCustomization: true,
			labelConfigCustomization: true,
			embeddingRepoContext: true,
			maxMonthlyReview: 5000,
			description: "Enterprise plan with full features",
		},
	];

	for (const plan of plans) {
		await prisma.plan.upsert({
			where: { name: plan.name },
			update: {},
			create: plan,
		});
	}

	console.log("Plan seed completed ✅");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
