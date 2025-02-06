<!-- Improved compatibility of back to top link -->

<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<div align="center">
  <h1 align="center">Agent Launchpad Starter Kit</h1>

  <p align="center">
    Example launchpad webapp that showcases how to deploy AI agents with non-custodial wallets. It uses Crossmint smart wallets and deploys agents in a TEE for secure key management.
    <br />
    <a href="https://github.com/crossmint/agent-launchpad-starter">View Demo</a>
    ·
    <a href="https://github.com/crossmint/agent-launchpad-starter/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/crossmint/agent-launchpad-starter/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

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

[x] Development mode  
[x] Production deploys  
[ ] Solana support  
[ ] Confidential environment variable setup  
[ ] Add support for more TEE networks

## About The Project

![Crossmint Agent Wallets](./crossmint-agent-wallets.png)

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

### Docker Setup (Requires OrbStack)

1. [Install OrbStack](https://orbstack.dev/) for local container management

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

2. Deploy Agent to Phala Cloud

   - Create an account on [Phala Cloud](https://cloud.phala.network)
   - Create a new project and copy the API key
   - Update the `PHALA_CLOUD_API_KEY` in your webapp's environment variables to add your Phala Cloud API key
      - NOTE: adding the API key to the environment variables will automatically use production environments in Phala Cloud. 
      - To use local environments, you can just leave `PHALA_CLOUD_API_KEY` empty.

3. Deploy Webapp

   - Deploy your Next.js application to your preferred hosting platform (Vercel, AWS, etc.)
   - Set up environment variables in your hosting platform's dashboard

4. Testing

   - Verify wallet creation flow works end-to-end
   - Test agent deployment and communication
   - Confirm authentication and authorization are working as expected

<p align="right">(<a href="#readme-top">back to top</a>)</p>
