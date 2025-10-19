import { parse } from "@typescript-eslint/typescript-estree";

export const extractImportPaths = (
	code: string,
	filePath: string
): string[] => {
	try {
		const ast = parse(code, {
			sourceType: "module",
			loc: true,
			range: true,
			tokens: true,
			comment: true,
			jsx: true,
			useJSXTextNode: false,
		});

		const imports: string[] = [];

		const visit = (node: any) => {
			if (
				node.type === "ImportDeclaration" &&
				typeof node.source?.value === "string"
			) {
				imports.push(node.source.value);
			}

			if (
				node.type === "CallExpression" &&
				node.callee.type === "Import" &&
				node.arguments[0]?.type === "Literal" &&
				typeof node.arguments[0].value === "string"
			) {
				imports.push(node.arguments[0].value);
			}

			if (
				node.type === "CallExpression" &&
				node.callee.type === "Identifier" &&
				node.callee.name === "require" &&
				node.arguments[0]?.type === "Literal" &&
				typeof node.arguments[0].value === "string"
			) {
				imports.push(node.arguments[0].value);
			}

			if (
				(node.type === "ExportAllDeclaration" ||
					node.type === "ExportNamedDeclaration") &&
				node.source &&
				typeof node.source.value === "string"
			) {
				imports.push(node.source.value);
			}

			for (const key in node) {
				if (node[key] && typeof node[key] === "object") {
					if (Array.isArray(node[key])) {
						node[key].forEach((child: any) => visit(child));
					} else if (key !== "parent") {
						visit(node[key]);
					}
				}
			}
		};

		visit(ast);
		return imports;
	} catch (error: any) {
		console.warn(`AST parse failed for ${filePath}:`, error.message);
		return [];
	}
};

export const resolveImportPath = (
	importPath: string,
	importerFile: string
): string | null => {
	if (!importPath.startsWith(".") && !importPath.startsWith("/")) return null;

	const importerDir = importerFile.substring(0, importerFile.lastIndexOf("/"));
	let resolved = importPath;

	if (importPath.startsWith("/")) {
		resolved = importPath.substring(1);
	} else {
		const parts = [...importerDir.split("/"), ...importPath.split("/")];
		const stack: string[] = [];
		for (const part of parts) {
			if (part === "..") stack.pop();
			else if (part !== "." && part !== "") stack.push(part);
		}
		resolved = stack.join("/");
	}

	const extensions = [".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.js"];
	for (const ext of extensions) {
		let candidate = resolved;
		if (!candidate.endsWith(ext)) {
			if (/\.\w+$/.test(candidate)) continue;
			candidate += ext;
		}
		return candidate;
	}

	return resolved + ".ts";
};

export const buildDependencyGraph = (files: Record<string, string>) => {
	const graph: Record<string, string[]> = {};
	for (const [path, code] of Object.entries(files)) {
		const imports = extractImportPaths(code, path)
			.map((i) => resolveImportPath(i, path))
			.filter(Boolean) as string[];
		graph[path] = imports;
	}
	return graph;
};
