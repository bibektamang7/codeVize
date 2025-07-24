import { ChromaClient } from "chromadb";

const host = process.env.CHROMA_DB_HOST || "localhost";
const port = Number(process.env.CHROMA_DB_PORT) || 8000;

const chroma = new ChromaClient({ host, port });
export { chroma };
