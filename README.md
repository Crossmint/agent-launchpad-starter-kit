<!-- Improved compatibility of back to top link -->

<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<div align="center">
  <h1 align="center">Agent Launchpad Starter Kit</h1>

  <p align="center">
    Example webapp that showcases how to deploy AI agents with non-custodial wallets. It uses Crossmint smart wallets and deploys agents in a TEE for secure key management.
    <br />
    <a href="https://github.com/crossmint/agent-launchpad-starter">View Demo</a>
    ·
    <a href="https://github.com/crossmint/agent-launchpad-starter/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/crossmint/agent-launchpad-starter/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

> **ℹ️ Beta Software Notice**
>
> This codebase is currently in beta and has not undergone formal security audits. It serves as an illustration and blueprint for implementing non-custodial wallet architectures in AI agent systems. Before using this in production:
>
> 1. **Conduct Security Audits**: Thoroughly review and audit the codebase, especially the wallet management and TEE deployment components
> 2. **Stay Updated**: Star and watch this repository to receive updates as we add functionality and enhance security measures
>
> We are actively improving the security and functionality of this codebase. Your feedback and contributions are welcome!

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#roadmap">Roadmap</a>
    </li>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#why-non-custodial">Why Non-Custodial?</a></li>
      </ul>
    </li>
    <li>
      <a href="#get-started">Get Started</a>
      <ul>
        <li><a href="#local-setup">Local Setup</a></li>
        <li><a href="#docker-setup-requires-orbstack">Docker Setup (Requires OrbStack)</a></li>
      </ul>
    </li>
    <li>
    <a href="#deploying-to-production">Deploying to Production</a>
      <ul>
        <li><a href="#building-the-docker-image">Building the Docker Image</a></li>
        <li><a href="#production-deployment-checklist">Production Deployment Checklist</a></li>
      </ul>
    </li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## Roadmap

[ ] Solana Smart Wallets (~Feb 10)  
[ ] Add support for more TEE networks: Marlin, Lit (~Feb 10)  
[ ] Sample code for user-initiated wallet actions  
[ ] Non-custodial agent software updates

## About The Project

![Crossmint Agent Wallets](https://github.com/user-attachments/assets/10f6f134-951a-4bea-8511-59e84940eb80)

The goal of this project is to help launchpads and other agent hosting patforms to easily
deploy AI agents with wallets, following an architecture that is non-custodial for the launchpad,
yet allows the agent owner and user to control the wallet.

It implements the architecture proposed on [this blog](https://article.app/alfonso/agent-launchpad-wallet-architecture).

### Key Features:

- Agent framework agnostic. Compatible with ElizaOS, Zerepy, GAME, Langchain, Vercel AI, and more.
- Chain agnostic. Currently works for all EVM chains, with Solana coming soon.
- Non-custodial for the launchpad: launchpad owner can't access the agent's funds / wallet. Required
  for regulatory compliance in the US.
- Dual-key architecture. Both agent owner and agent itself can control the wallet.
- The frontend uses NextJS and the agents are deployed into a TEE by Phala network

### Why Non-Custodial?

When developing AI agents with cryptocurrency capabilities, two critical challenges emerge:

**1. Security Considerations:**  
The traditional custodial approach creates significant security risks. If a launchpad platform holds custody of agent wallets, a single security breach could compromise all agents' funds. Non-custodial architecture eliminates this single point of failure, ensuring that each agent maintains independent control of its assets.

**2. Regulatory Compliance:**  
In jurisdictions like the United States, platforms that have the ability to control or transmit user funds may fall under money transmitter regulations. This creates complex regulatory requirements and potential legal exposure. Non-custodial architecture helps platforms avoid classification as money transmitters by ensuring they never have direct access to or control over user funds.

## Get started

![Agent Launchpad Starter Kit](https://github.com/user-attachments/assets/364ad94a-cea1-42e5-928c-a75bc7b9709a)

### Pre-requisites

1. [Install pnpm](https://pnpm.io/installation) as package manager
2. [Install OrbStack](https://orbstack.dev/) for local container management
3. Create a developer project in Crossmint [staging console](https://staging.crossmint.com/console) and [production](https://www.crossmint.com/console)

### Local Setup

1. Obtain free API Keys from the [Staging environment of Crossmint Console](https://staging.crossmint.com). You'll need both a server-side and client-side API Key. Refer to these instructions to [Get a server-side API Key](https://docs.crossmint.com/introduction/platform/api-keys/server-side) and [a client-side one](https://docs.crossmint.com/introduction/platform/api-keys/client-side).

   - Ensure API keys have the required scopes:
     - Server-side: All 'wallet API' scopes
     - Client-side: All 'wallet API' and 'users' scopes. Whitelist `http://localhost:3001` as an origin

2. Webapp setup

   ```bash
   cd launchpad-starter-next-app
   pnpm install
   cp .env.example .env
   ```

   Enter your Crossmint API keys in the `.env` file. Leave the URL as is.

   Then start the webapp:

   ```bash
   pnpm dev
   ```

The Next.js app will be available at `http://localhost:3001`

3. Agent setup

   Open a new terminal in the project root folder, and run:

   ```bash
   cd agent-tee-phala
   pnpm install
   cp .env.example .env
   ```

   Then start the agent:

   ```bash
   pnpm dev
   ```

The Express server will be available at `http://localhost:4000`.

## Deploying to Production

### Building the Docker Image

1. From the root directory of this project, run the following command to build the Docker image:

```bash
docker build --pull --rm -f 'agent-tee-phala/image/Dockerfile' --platform linux/amd64 -t '{your-image-name}:{version}' 'agent-tee-phala/image'
```

Example:

```bash
docker build --pull --rm -f 'agent-tee-phala/image/Dockerfile' --platform linux/amd64 -t 'agentlaunchpadstarterkit:latest' 'agent-tee-phala/image'
```

2. In the [`launchpad-starter-next-app/src/server/services/container.ts`](launchpad-starter-next-app/src/server/services/container.ts), there's a inline comment that explains how to update the docker image name and version. Go to line 47 to find the instructions.

### Production Deployment Checklist

1. API Keys

   - Replace staging API keys with production keys from [Crossmint Console](https://www.crossmint.com/console)
   - Ensure API keys have the required scopes:
     - Server-side: All 'wallet API' scopes
     - Client-side: All 'wallet API' and 'users' scopes. Whitelist your webapp url as an origin.

2. Security Checklist

   - Verify and audit all code in your agent image folder to ensure it meets security standards
   - Publish reproduceable build code to an open source repository for transparency
   - Implement client-side checks to prevent agent deployments to TEEs that cannot remotely attest they are running audited code versions
   - Configure TEE to disallow code upgrades without explicit end user approval (feature coming soon to Phala and Marlin)

3. Deploy Agent to TEE (Phala Cloud)

   - Create an account on [Phala Cloud](https://cloud.phala.network)
   - Create a new project and copy the API key
   - Update the `PHALA_CLOUD_API_KEY` in your webapp's environment variables to add your Phala Cloud API key
     - NOTE: adding the API key to the environment variables will automatically use production environments in Phala Cloud.
     - To use local environments, you can just leave `PHALA_CLOUD_API_KEY` empty.

4. Deploy Webapp

   - Deploy your Next.js application to your preferred hosting platform (Vercel, AWS, etc.)
   - Set up environment variables in your hosting platform's dashboard

5. Testing

   - Verify wallet creation flow works end-to-end
   - Test agent deployment and communication
   - Confirm authentication and authorization are working as expected

## Disclaimer

This software is provided "AS IS", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
