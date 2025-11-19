import express from "express";
import cors from "cors";
import { errorHandler } from "./v1/utils/apiErrorHandler";
import { githubApp, createNodeMiddleware } from "github-config";
import compression from "compression";

const app = express();

const middleware = createNodeMiddleware(githubApp.webhooks, {
	path: "/api/v1/githubs/webhook",
});

app.use(middleware);

// const ALLOWED_HEADERS = process.env.ALLOWED_HEADERS;
app.use(
	cors({
		origin: process.env.CORS_ORIGIN || "http://localhost:3000",
		credentials: true,
		methods: ["POST", "GET", "PATCH", "PUT", "DELETE"],
	})
);

app.use(compression());
app.use(express.json());

app.get("/health", (req, res) => {
	res.status(200).json({ status: "OK" });
});

import userRouter from "./v1/routes/user.route";
import repositoryRouter from "./v1/routes/repository.route";
import planRouter from "./v1/routes/plan.route";
import paymentRouter from "./v1/routes/payment.route";
import adminRouter from "./v1/routes/admin.route";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/repositories", repositoryRouter);
app.use("/api/v1/plans", planRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/admin", adminRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	console.log(`Application is listening at ${PORT}`);
});
