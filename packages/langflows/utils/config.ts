export const embeddingModelName =
	process.env.EMBEDDING_MODEL || "unclemusclez/jina-embeddings-v2-base-code";
export const embeddingModelUrl =
	process.env.EMBEDDING_MODEL_URL || "http://localhost:11434";

// const vectorDBUrl = process.env.VECTOR_DB_URL || "http://localhost:8000";
export const vectorDBHost = process.env.VECTOR_DB_HOST || "localhost";
export const vectorDBPort = process.env.VECTOR_DB_PORT || 8000;
export const vectorDBSSL =
	process.env.VECTOR_DB_SSL || vectorDBHost === "localhost" ? false : true;
