"use client";

import { Fireworks } from "@/components/fireworks";
import { DeployAgentButton } from "@/components/deploy-agent-button";
import { PoweredByCrossmint } from "@/components/powered-by-crossmint";
import { SignInAuthButton } from "@/components/signin-auth-button";
import { Typography } from "@/components/typography";
import Link from "next/link";
import { useState } from "react";

import { useWallet } from "@crossmint/client-sdk-react-ui";

function HomePrimaryAction() {
    const { status: walletStatus } = useWallet();
    const [agentSuccessfullyDeployed, setAgentSuccessfullyDeployed] = useState(false);

    if (walletStatus !== "loaded") {
        return <SignInAuthButton />;
    }

    if (agentSuccessfullyDeployed) {
        return (
            <>
                <Fireworks />
                <div className="flex gap-2 items-center self-center min-h-[52px]">
                    <Link
                        href="/agents"
                        className="underline text-secondary-foreground text-lg font-semibold underline-offset-4"
                    >
                        View Rufus
                    </Link>
                </div>
            </>
        );
    } else {
        return <DeployAgentButton setAgentSuccessfullyDeployed={setAgentSuccessfullyDeployed} />;
    }
}

export default function Home() {
    return (
        <div className="flex h-full w-full items-center md:p-4 justify-center">
            <div className="flex flex-col pb-12 items-center max-w-[538px] p-4">
                <div className="flex flex-col gap-2 text-center pb-8">
                    <Typography
                        style={{
                            background: "linear-gradient(to right, #1B2C60, #7d98eb)",
                            WebkitBackgroundClip: "text",
                            color: "transparent",
                        }}
                        variant={"h1"}
                    >
                        Agent Launchpad
                    </Typography>
                    <Typography className="text-primary-foreground text-center">
                        A secure, non-custodial Next.js application for deploying AI agents with integrated wallet
                        functionality
                    </Typography>
                </div>

                <div className="flex flex-col w-full md:max-w-[340px] gap-10">
                    <div className="bg-card flex flex-col p-5 rounded-3xl shadow-dropdown">
                        <img
                            className="rounded-xl rounded-bl-none rounded-br-none"
                            src={"/ai-agent.png"}
                            alt="ai agent"
                        />
                        <div className="py-4">
                            <Typography className="text-secondary-foreground" variant="h3">
                                Agent Rufus
                            </Typography>
                            <Typography className="text-muted-foreground" variant="h5">
                                by Crossmint
                            </Typography>
                        </div>
                    </div>
                    <HomePrimaryAction />

                    <PoweredByCrossmint />
                </div>
            </div>
        </div>
    );
}
