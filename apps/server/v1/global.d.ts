import type { Request } from "express";
interface User {
	id: string;
	activeRepos: number;
	planName: string;
	plan: {
		id: string;
		name: any;
		price: number | null;
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
