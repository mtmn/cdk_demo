import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";

import type { Construct } from "constructs";
import { AppConfig } from "../config";

interface ApplicationStackProps extends cdk.StackProps {
	vpc: ec2.IVpc;
	listener: elbv2.IApplicationListener;
	loadBalancer: elbv2.IApplicationLoadBalancer;
}

export class ApplicationStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: ApplicationStackProps) {
		super(scope, id, props);

		// Create ECS Cluster
		const cluster = new ecs.Cluster(this, "Cluster", {
			vpc: props.vpc,
			clusterName: `${AppConfig.baseResourceName}-cluster`,
		});

		// Task Definition
		const taskDefinition = new ecs.FargateTaskDefinition(this, "TaskDef", {
			memoryLimitMiB: 512,
			cpu: 256,
		});

		const container = taskDefinition.addContainer("NginxContainer", {
			image: ecs.ContainerImage.fromRegistry("docker.io/nginx:latest"),
			logging: ecs.LogDrivers.awsLogs({
				streamPrefix: AppConfig.baseResourceName,
			}),
		});

		container.addPortMappings({
			containerPort: 80,
		});

		// Create Fargate service in a private network
		const service = new ecs.FargateService(this, "Service", {
			cluster,
			taskDefinition,
			desiredCount: 1,
			minHealthyPercent: 100, // since we only run one replica
			vpcSubnets: {
				subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
			},
			serviceName: `${AppConfig.baseResourceName}-service`,
			healthCheckGracePeriod: cdk.Duration.seconds(60),
		});

		// Allow traffic from ALB
		service.connections.allowFrom(props.loadBalancer, ec2.Port.tcp(80));

		// Create Target Group for the service
		const targetGroup = new elbv2.ApplicationTargetGroup(this, "TargetGroup", {
			vpc: props.vpc,
			port: 80,
			protocol: elbv2.ApplicationProtocol.HTTP,
			targets: [
				service.loadBalancerTarget({
					containerName: "NginxContainer",
					containerPort: 80,
				}),
			],
			healthCheck: {
				path: "/",
				interval: cdk.Duration.seconds(60),
			},
		});

		new elbv2.ApplicationListenerRule(this, "ForwardRule", {
			listener: props.listener,
			targetGroups: [targetGroup],
			priority: 1,
			conditions: [elbv2.ListenerCondition.pathPatterns(["*"])],
		});
	}
}
