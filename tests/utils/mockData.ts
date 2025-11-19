export const fakePRPayload = {
	action: "opened",
	number: 42,
	repository: {
		id: "test-123",
		name: "my-repo",
		owner: { login: "my-org" },
	},
	installation: { id: 999 },
	sender: { login: "test-user" },
	pull_request: {
		number: 42,
		title: "Add new feature",
	},
};
