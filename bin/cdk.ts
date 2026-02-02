#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";

import { AppConfig } from "../lib/config";
import { ApplicationStack } from "../lib/stacks/application";
import { IamStack } from "../lib/stacks/iam";
import { NetworkStack } from "../lib/stacks/network";

const app = new cdk.App();

// Apply mandatory tags
Object.entries(AppConfig.mandatoryTags).forEach(([key, value]) => {
	cdk.Tags.of(app).add(key, value);
});

new IamStack(app, `${AppConfig.baseResourceName}-IamStack`, {
	// env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});
const networkStack = new NetworkStack(
	app,
	`${AppConfig.baseResourceName}-NetworkStack`,
	{},
);

new ApplicationStack(app, `${AppConfig.baseResourceName}-ApplicationStack`, {
	vpc: networkStack.vpc,
	listener: networkStack.listener,
	loadBalancer: networkStack.loadBalancer,
});

app.synth();
