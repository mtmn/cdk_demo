import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import type { Construct } from "constructs";
import { AppConfig } from "../config";

export class IamStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const role = new iam.Role(this, "CdkDeploymentRole", {
			assumedBy: new iam.AccountRootPrincipal(),
			roleName: `${AppConfig.baseResourceName}-deployment-role`,
			description: "Role for deploying CDK application",
		});

		// note(mtoman): this is extremely reckless policy, would have used more granular policies in a real system
		role.addToPolicy(
			new iam.PolicyStatement({
				effect: iam.Effect.ALLOW,
				actions: [
					"cloudformation:*",
					"s3:*",
					"ec2:*",
					"elasticloadbalancing:*",
					"ecs:*",
					"iam:*",
					"logs:*",
					"ssm:*",
					"events:*",
					"application-autoscaling:*",
					"cognito-idp:*",
				],
				resources: ["*"],
				conditions: {
					StringEquals: {
						"aws:ResourceAccount": this.account,
					},
				},
			}),
		);

		new cdk.CfnOutput(this, "DeploymentRoleArn", {
			value: role.roleArn,
		});
	}
}
