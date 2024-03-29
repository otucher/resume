#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { getEnvVar } from "../lib/utils";
import FargateStack from "../lib/fargate-stack";
import RepoStack from "../lib/repo-stack";
import CognitoStack from "../lib/cognito-stack";

const repositoryName = getEnvVar("REPOSITORY", "resume");
const stackProps = {
  env: {
    account: getEnvVar("AWS_ACCOUNT_ID"),
    region: getEnvVar("AWS_DEFAULT_REGION", "us-east-1"),
  }
}
const app = new cdk.App();

const repoStack = new RepoStack(app, "resume-repo", {
  repositoryName,
  ...stackProps,
});

const cognitoStack = new CognitoStack(app, "resume-cognito", {
  googleSecretId: "resume/google-oauth2",
  domainName: "resume-oliver-tucher",
  callbackUrls: [
    "https://resume.oliver-tucher.com/user",  // match client/src/amplify.ts !
    "http://localhost:3000/user",
  ],
  ...stackProps,
});

const fargateStack = new FargateStack(app, "resume", {
  repository: repoStack.repository,
  cognitoSecret: cognitoStack.cognitoSecret,
  gitTag: getEnvVar("GIT_TAG", "latest"),
  ...stackProps,
});
fargateStack.addDependency(repoStack);
fargateStack.addDependency(cognitoStack);
