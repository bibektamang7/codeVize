import express from "express";
import cors from "cors";

const app = express();

app.use(
	cors({
		allowedHeaders: ["http://localhost:3000"],
		credentials: true,
		methods: ["POST", "GET", "PATCH", "PUT", "DELETE"],
	})
);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
	console.log(`Application is listening at ${PORT}`);
});
