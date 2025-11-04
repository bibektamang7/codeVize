import jwt from "jsonwebtoken";

const verifyJWTToken = (token: string) => {
	try {
		const tokenSecretKey = process.env.TOKEN_SECRET;
		const decodedToken = jwt.verify(token, tokenSecretKey!);
		return decodedToken;
	} catch (error: any) {
		console.error(`JWT Token verification failed`, error);
		throw new Error(error);
	}
};

const createToken = (id: string) => {
	const token = jwt.sign({ id: id }, process.env.TOKEN_SECRET!, {
		expiresIn: "7d",
	});
	return token;
};

export { verifyJWTToken, createToken };
