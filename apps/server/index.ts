import express from "express";
import cors from "cors";

import bodyParser from "body-parser";

const app = express();

const ALLOWED_HEADERS = process.env.ALLOWED_HEADERS;

app.use(
	cors({
		allowedHeaders: ALLOWED_HEADERS,
		credentials: true,
		methods: ["POST", "GET", "PATCH", "PUT", "DELETE"],
	})
);

// import userRouter from "./v1/routes/user.route";
import githubRouter from "./v1/routes/github.route";

// app.use("/api/v1/users", userRouter);
app.use("/api/v1/githubs",express.raw({type: "application/json"}), githubRouter);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
	console.log(`Application is listening at ${PORT}`);
});
