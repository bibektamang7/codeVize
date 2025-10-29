export class ApiError extends Error {
	statusCode: number;
	errors: string[];
	success: boolean;
	data?: any;

	constructor(
		statusCode: number,
		message: string = "Something went wrong",
		errors: string[] = [],
		stack: string = "",
		data?: any
	) {
		super(message);
		this.message = message;
		this.statusCode = statusCode;
		this.errors = errors;
		this.success = false;
		this.data = data;

		if (stack) {
			this.stack = stack;
		} else {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}

export const errorHandler = (err: any, req: any, res: any, next: any) => {
	if (err instanceof ApiError) {
		return res.status(err.statusCode).json({
			success: err.success,
			message: err.message,
			errors: err.errors,
			data: err.data,
			...(process.env.NODE_ENV === "development" && { stack: err.stack }),
		});
	}
	console.log("reason for error", err);

	let statusCode = 500;
	let message = "Internal server error";
	let errors: string[] = [];

	if (err.name === "ValidationError") {
		statusCode = 400;
		message = "Validation Error";
		if (err.errors) {
			errors = Object.values(err.errors).map((e: any) => e.message);
		}
	} else if (err.name === "CastError") {
		statusCode = 400;
		message = "Invalid input format";
		errors = [err.message];
	} else if (err.code === 11000) {
		statusCode = 409;
		message = "Duplicate field value entered";
		errors = [`${Object.keys(err.keyValue)[0]} already exists`];
	} else {
		// For unknown errors, just send the error message
		message = err.message || message;
	}

	return res.status(statusCode).json({
		success: false,
		message,
		errors,
		data: null,
		...(process.env.NODE_ENV === "development" && { stack: err.stack }),
	});
};

export const asyncHandler =
	(fn: Function) => (req: any, res: any, next: any) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
