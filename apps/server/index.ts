import express from "express";
import cors from "cors";
import { errorHandler } from "./v1/utils/apiErrorHandler";
import { githubApp, createNodeMiddleware } from "github-config";

const app = express();
const middleware = createNodeMiddleware(githubApp.webhooks, {
	path: "/api/v1/githubs/webhook",
});

app.use(middleware);

// const ALLOWED_HEADERS = process.env.ALLOWED_HEADERS;
app.use(
	cors({
		// allowedHeaders: ALLOWED_HEADERS,
		// allowedHeaders: ["http://localhost:3000"],
		origin: "http://localhost:3000",
		credentials: true,
		methods: ["POST", "GET", "PATCH", "PUT", "DELETE"],
	})
);

app.use(express.json());

import userRouter from "./v1/routes/user.route";
import repositoryRouter from "./v1/routes/repository.route";
import planRouter from "./v1/routes/plan.route";
import paymentRouter from "./v1/routes/payment.route";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/repositories", repositoryRouter);
app.use("/api/v1/plans", planRouter);
app.use("/api/v1/payments", paymentRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	console.log(`Application is listening at ${PORT}`);
});
