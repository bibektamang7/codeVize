import type { Request } from "express";
interface User {
	id: string;
	activeRepos: number,
	plan: {
		id: string;
		name: any;
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
