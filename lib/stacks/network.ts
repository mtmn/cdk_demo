import * as cdk from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import type { Construct } from "constructs";
import { AppConfig } from "../config";

export interface NetworkStackProps extends cdk.StackProps {}

export class NetworkStack extends cdk.Stack {
	public readonly vpc: ec2.Vpc;
	public readonly loadBalancer: elbv2.ApplicationLoadBalancer;
	public readonly listener: elbv2.ApplicationListener;

	constructor(scope: Construct, id: string, props: NetworkStackProps) {
		super(scope, id, props);

		// Create VPC with public and private subnets in three availability zones
		this.vpc = new ec2.Vpc(this, "Vpc", {
			vpcName: `${AppConfig.baseResourceName}-vpc`,
			maxAzs: 3,
			subnetConfiguration: [
				{
					cidrMask: 24,
					name: `${AppConfig.baseResourceName}-public`,
					subnetType: ec2.SubnetType.PUBLIC,
				},
				{
					cidrMask: 24,
					name: `${AppConfig.baseResourceName}-private`,
					subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
				},
			],
		});

		// Create a public ALB
		this.loadBalancer = new elbv2.ApplicationLoadBalancer(this, "PublicAlb", {
			vpc: this.vpc,
			internetFacing: true,
			loadBalancerName: `${AppConfig.baseResourceName}-alb`,
		});

		new cdk.CfnOutput(this, "LoadBalancerDNS", {
			value: this.loadBalancer.loadBalancerDnsName,
		});

		this.listener = this.loadBalancer.addListener("HttpListener", {
			port: 80,
			open: true,
			defaultAction: elbv2.ListenerAction.fixedResponse(404, {
				contentType: "text/plain",
			}),
		});

		// CloudFront Function to block specific header
		const headerBlockFunction = new cloudfront.Function(
			this,
			"HeaderBlockFunction",
			{
				code: cloudfront.FunctionCode.fromInline(`
function handler(event) {
  var request = event.request;
  var headers = request.headers;

  if (headers['x-exploit-activate'] && headers['x-exploit-activate'].value === 'true') {
    return {
      statusCode: 403,
      statusDescription: 'Forbidden',
      headers: {
        'content-type': {
          value: 'text/plain'
        }
      },
      body: {
        encoding: 'text',
        data: 'princess is in another castle'
      }
    };
  }

  return request;
}
        `),
			},
		);

		// Create CloudFront Distribution
		const distribution = new cloudfront.Distribution(this, "Distribution", {
			defaultBehavior: {
				origin: new origins.LoadBalancerV2Origin(this.loadBalancer, {
					protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY, // Use HTTP to origin
				}),
				viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
				allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
				cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
				functionAssociations: [
					{
						function: headerBlockFunction,
						eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
					},
				],
			},
			comment: `${AppConfig.baseResourceName} distribution`,
		});

		new cdk.CfnOutput(this, "CloudFrontDNS", {
			value: distribution.distributionDomainName,
		});
	}
}
