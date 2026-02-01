const mandatoryTags = {
	Project: "cdk-demo",
	Environment: "dev",
	ManagedBy: "aws-cdk",
	Repository: "https://github.com/mtmn/cdk_demo",
};

export const AppConfig = {
	mandatoryTags,
	baseResourceName: `${mandatoryTags.Environment}-${mandatoryTags.Project}`,
};
