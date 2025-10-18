import express from "express";
import cors from "cors";

const app = express();

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

import userRouter from "./v1/routes/user.route";
import repositoryRouter from "./v1/routes/repository.route";
import planRouter from "./v1/routes/plan.route";
import paymentRouter from "./v1/routes/payment.route";
import repoConfigRouter from "./v1/routes/repo-config.route";
import generalConfigRouter from "./v1/routes/general-config.route";
import reviewConfigRouter from "./v1/routes/review-config.route";
import pathConfigRouter from "./v1/routes/path-config.route";
import labelConfigRouter from "./v1/routes/label-config.route";
import repoErrorLogRouter from "./v1/routes/repo-error-log.route";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/repositories", repositoryRouter);
app.use("/api/v1/plans", planRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/repo-configs", repoConfigRouter);
app.use("/api/v1/general-configs", generalConfigRouter);
app.use("/api/v1/review-configs", reviewConfigRouter);
app.use("/api/v1/path-configs", pathConfigRouter);
app.use("/api/v1/label-configs", labelConfigRouter);
app.use("/api/v1/repo-error-logs", repoErrorLogRouter);

import { githubApp, createNodeMiddleware } from "github-config";

const middleware = createNodeMiddleware(githubApp.webhooks, {
	path: "/api/v1/githubs/webhook",
});

app.use(middleware);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	console.log(`Application is listening at ${PORT}`);
});
