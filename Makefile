.PHONY: synth bootstrap list diff deploy-all deploy-iam deploy-net deploy-app help noop

.DEFAULT_GOAL := help

.EXPORT_ALL_VARIABLES:
ENVIRONMENT = dev
PROJECT     = cdk-demo
REPOSITORY  = https://github.com/mtmn/cdk_demo

synth: ## Translates ts files into json that is then fed to cfn
	npx cdk synth

bootstrap: ## Deploys prerequisites for running `cdk deploy`
	npx cdk bootstrap

list: ## Lists all available stacks
	npx cdk list

diff: ## Shows diff between local and remote state
	npx cdk diff

deploy-all: deploy-iam deploy-net deploy-app ## Deploys all stacks

deploy-iam: ## Deploys IamStack
	npx cdk deploy $(ENVIRONMENT)-$(PROJECT)-IamStack

deploy-net: ## Deploys NetworkStack
	npx cdk deploy $(ENVIRONMENT)-$(PROJECT)-NetworkStack

deploy-app: ## Deploys ApplicationStack
	npx cdk deploy $(ENVIRONMENT)-$(PROJECT)-ApplicationStack

help: ## Shows help (this)
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

%: noop ## Avoid "nothing to be done" for any target that doesn't have a rule
	@:
