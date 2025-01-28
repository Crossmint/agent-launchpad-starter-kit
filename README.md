<!-- Improved compatibility of back to top link -->

<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<div align="center">
  <h1 align="center">Agent Launchpad Starter Kit</h1>

  <p align="center">
    A secure, non-custodial Next.js application for deploying AI agents with integrated wallet functionality
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
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#why-non-custodial">Why Non-Custodial?</a></li>
      </ul>
    </li>
    <li>
      <a href="#development">Development</a>
      <ul>
        <li><a href="#local-setup">Local Setup</a></li>
        <li><a href="#docker-setup-requires-orbstack">Docker Setup (Requires OrbStack)</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

![Agent Launchpad Starter Kit](https://github.com/user-attachments/assets/364ad94a-cea1-42e5-928c-a75bc7b9709a)

Agent Launchpad Starter Kit is an open-source platform that enables secure deployment of AI agents through an intuitive user interface. The platform creates a seamless experience for agent creators while maintaining robust security and regulatory compliance through non-custodial wallet architecture.

### Key Features:

- Secure user authentication and wallet creation
- Non-custodial agent deployment system
- Delegated key management for agent registration
- Built on Next.js for optimal performance and scalability
- Trusted Execution Environment (TEE) integration

### Why Non-Custodial?

When developing AI agents with cryptocurrency capabilities, two critical challenges emerge:

**1. Security Considerations:**  
The traditional custodial approach creates significant security risks. If a launchpad platform holds custody of agent wallets, a single security breach could compromise all agents' funds. Non-custodial architecture eliminates this single point of failure, ensuring that each agent maintains independent control of its assets.

**2. Regulatory Compliance:**  
In jurisdictions like the United States, platforms that have the ability to control or transmit user funds may fall under money transmitter regulations. This creates complex regulatory requirements and potential legal exposure. Non-custodial architecture helps platforms avoid classification as money transmitters by ensuring they never have direct access to or control over user funds.

## Development

### Local Setup

1. Obtain free API Key's from the Crossmint Console. You'll need both a server-side and client-side API Key. Refer to [Get an API Key](https://docs.crossmint.com/verifiable-credentials/quickstart#2-get-an-api-key) from the Quickstart guide for detailed instructions.

2. Set up environment variables:
   ```bash
   # For Next.js app
   cd launchpad-starter-next-app
   cp .env.example .env
   
   # For Express server
   cd ../agent-tee-phala
   cp .env.example .env
   ```
   To run the staging db, make sure to use a staging API key from the Crossmint Console, otherwise, it will default to local.

2. Install dependencies for both applications:
   ```bash
   # In each directory (launchpad-starter-next-app and agent-tee-phala)
   pnpm install
   ```

3. Start the applications:
   ```bash
   # In /launchpad-starter-next-app
   pnpm dev

   # In /agent-tee-phala (separate terminal)
   pnpm dev
   ```

### Docker Setup (Requires OrbStack)

1. [Install OrbStack](https://orbstack.dev/) for local container management


The Next.js app will be available at `http://localhost:3001` and the Express server at `http://localhost:4000`.

<!-- USAGE EXAMPLES -->

## Usage

This starter kit is designed for:

- Workflow automation platforms
- Multi-tenant agent providers
- Infrastructure companies supporting AI agent deployment
- B2B companies creating user-owned or company-owned agents

Examples include:

- Cognition Labs (DevOps agents)
- 11x (GTM agents)
- Other agent infrastructure providers

_For more examples, please refer to the [Documentation](https://docs.crossmint.com/docs/agent-launchpad)_

<p align="right">(<a href="#readme-top">back to top</a>)</p>

