# cdk_demo
Deploy a sample AWS Fargate application using [CDK Toolkit](https://github.com/aws/aws-cdk) and TypeScript.

[cdk.json](cdk.json) contains details on how CDK Toolkit executes the deployments.

There are three stacks:
- IamStack which provisions policies and roles (which are extremely insecure at the moment, be vary of that)
- NetworkStack scaffolds entire network (public and private) + provisions `ALB` and `CloudFront`
- ApplicationStack deploys `nginx:latest` container into ECS and ties it to network components created in previous stack

Run `make help` for frequently used commands.
