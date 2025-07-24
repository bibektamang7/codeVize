import jwt from "jsonwebtoken";

const verifyJWTToken = (token: string) => {
	try {
		const tokenSecretKey = process.env.TOKEN_SECRET;
		const decodedToken = jwt.verify(token, tokenSecretKey!);
		return decodedToken;
	} catch (error) {
		console.error(`JWT Token verification failed`, error);
	}
};

export { verifyJWTToken };
