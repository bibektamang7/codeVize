import type { Request } from "express";
import { ExistingPlan } from "db/prisma";
export interface User {
	id: string;
	activeRepos: number;
	planName: string;
	plan: {
		id: string;
		name: ExistingPlan;
		price: number;
		maxRepos: number;
		description: string;
		createdAt: Date;
		updatedAt: Date;
	};
}
declare global {
	namespace Express {
		interface Request {
			user: User;
		}
	}
}
