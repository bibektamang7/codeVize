import express from "express";
// import { prisma } from "db/prisma";
import cors from "cors";
// import { embedRepoChain } from "langflows/chains/embedRepo";

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
// import githubRouter from "./v1/routes/github.route";

app.use("/api/v1/users", userRouter);
// app.use("/api/v1/githubs", githubRouter);

import { githubApp, createNodeMiddleware } from "github-config";

const middleware = createNodeMiddleware(githubApp.webhooks, {
	path: "/api/v1/githubs/webhook",
});

app.use(middleware);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	console.log(`Application is listening at ${PORT}`);
});
