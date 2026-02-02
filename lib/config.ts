const mandatoryTags: Record<string, string> = {
	Project:
		process.env.PROJECT ??
		(() => {
			throw new Error("PROJECT is required");
		})(),
	Environment:
		process.env.ENVIRONMENT ??
		(() => {
			throw new Error("ENVIRONMENT is required");
		})(),
	Repository:
		process.env.REPOSITORY ??
		(() => {
			throw new Error("REPOSITORY is required");
		})(),
	ManagedBy: "aws-cdk",
};

export const AppConfig = {
	mandatoryTags,
	baseResourceName: `${mandatoryTags.Environment}-${mandatoryTags.Project}`,
};
