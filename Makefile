.PHONY: synth bootstrap list diff deploy help noop

.DEFAULT_GOAL := help

synth: ## Translates ts files into json that is then fed to cfn
	npx cdk synth

bootstrap: ## Sets preprequisites for `cdk deploy`
	npx cdk bootstrap

list: ## Lists all available stacks
	npx cdk list

diff: ## Shows diff between local and remote state
	npx cdk diff

deploy: ## Deploys and runs cfn stacks, add --all to deploy everything
	npx cdk deploy

help: ## Shows help (this)
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

%: noop ## Avoid "nothing to be done" for any target that doesn't have a rule
	@:
