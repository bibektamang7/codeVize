import type { Request } from "express";
interface User {}
declare global {
	namespace Express {
		interface Request {
			user: User;
		}
	}
}
