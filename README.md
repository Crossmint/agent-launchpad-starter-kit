# Agent Launchpad Starter Kit

<!-- Improved compatibility of back to top link -->

<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<div align="center">
  <a href="https://github.com/crossmint/agent-launchpad-starter">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Agent Launchpad Starter Kit</h3>

  <p align="center">
    A secure, non-custodial Next.js application for deploying AI agents with integrated wallet functionality
    <br />
    <a href="https://github.com/crossmint/agent-launchpad-starter"><strong>Explore the docs »</strong></a>
    <br />
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
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

[![Agent Launchpad Screenshot][product-screenshot]](https://example.com)

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

### Built With

- [![Next][Next.js]][Next-url]
- [![React][React.js]][React-url]
- Trusted Execution Environment (TEE)
- Non-custodial Wallet Infrastructure

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

- npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Get your API Keys from CrossMint

2. Clone the repo

   ```sh
   git clone https://github.com/crossmint/agent-launchpad-starter.git
   ```

3. Install NPM packages

   ```sh
   npm install
   ```

4. Enter your API keys in `config.js`

   ```js
   const API_KEY = "ENTER YOUR CROSSMINT API KEY";
   ```

5. Change git remote url to avoid accidental pushes to base project
   ```sh
   git remote set-url origin your-username/your-repo-name
   git remote -v # confirm the changes
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

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

<!-- ROADMAP -->

## Roadmap

- [ ] Multi-wallet support
- [ ] Advanced TEE integration
- [ ] Enhanced security features
- [ ] Multi-sig support
- [ ] Advanced key rotation

See the [open issues](https://github.com/crossmint/agent-launchpad-starter/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

CrossMint - [@Crossmint Support](https://twitter.com/crossmint)

Project Link: [https://github.com/crossmint/agent-launchpad-starter](https://github.com/crossmint/agent-launchpad-starter)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [CrossMint Documentation](https://docs.crossmint.com/)
- [TEE Security Best Practices](https://example.com)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->

[contributors-shield]: https://img.shields.io/github/contributors/crossmint/agent-launchpad-starter.svg?style=for-the-badge
[contributors-url]: https://github.com/crossmint/agent-launchpad-starter/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/crossmint/agent-launchpad-starter.svg?style=for-the-badge
[forks-url]: https://github.com/crossmint/agent-launchpad-starter/network/members
[stars-shield]: https://img.shields.io/github/stars/crossmint/agent-launchpad-starter.svg?style=for-the-badge
[stars-url]: https://github.com/crossmint/agent-launchpad-starter/stargazers
[issues-shield]: https://img.shields.io/github/issues/crossmint/agent-launchpad-starter.svg?style=for-the-badge
[issues-url]: https://github.com/crossmint/agent-launchpad-starter/issues
[license-shield]: https://img.shields.io/github/license/crossmint/agent-launchpad-starter.svg?style=for-the-badge
[license-url]: https://github.com/crossmint/agent-launchpad-starter/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/company/crossmint
[product-screenshot]: images/screenshot.png
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
