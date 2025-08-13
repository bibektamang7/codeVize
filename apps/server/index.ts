import express from "express";
import { prisma } from "db/prisma";
import cors from "cors";
import { embedRepoChain } from "langflows/chains/embedRepo";

const app = express();

const ALLOWED_HEADERS = process.env.ALLOWED_HEADERS;

app.use(
	cors({
		allowedHeaders: ALLOWED_HEADERS,
		credentials: true,
		methods: ["POST", "GET", "PATCH", "PUT", "DELETE"],
	})
);

import {
	githubApp,
	createNodeMiddleware,
} from "github-config";

const middleware = createNodeMiddleware(githubApp.webhooks, {
	path: "/api/v1/githubs/webhook",
});

app.use(middleware);

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
	console.log(`Application is listening at ${PORT}`);
});
