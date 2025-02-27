"use client";

import { useState } from "react";
import Link from "next/link";
import { Fireworks } from "@/components/fireworks";
import { DeployAgentButton } from "@/components/deploy-agent-button";
import { PoweredByCrossmint } from "@/components/powered-by-crossmint";
import { Typography } from "@/components/typography";
import { useWallet } from "./providers/wallet-provider";
import { SignInAuthButton } from "@/components/signin-auth-button";
import type { Wallet } from "./types/wallet";
import WalletTypeSelector from "@/components/wallet-type-selector";
import Image from "next/image";

function HomePrimaryAction({ wallet }: { wallet: Wallet | null }) {
    const [agentSuccessfullyDeployed, setAgentSuccessfullyDeployed] = useState(false);

    if (wallet == null) {
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
    const { wallet, walletType, setWalletType } = useWallet();

    return (
        <div className="flex h-full w-full items-center md:p-4 justify-center">
            <div className="flex flex-col pb-12 items-center p-4 gap-4">
                <div className="flex flex-col gap-2 text-center max-w-[538px] pb-8">
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

                <div className="flex w-full gap-4 bg-card rounded-3xl p-6 shadow-md">
                    <div className="w-16 flex items-center justify-center">
                        <Image src="/ai-agent.png" alt="ai agent" width={64} height={64} className="rounded-md" />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                            <h2 className="text-gray-700 font-medium">Agent Rufus</h2>
                            <h5 className="text-muted">by Crossmint</h5>
                        </div>
                    </div>
                </div>

                <WalletTypeSelector value={walletType} onChange={setWalletType} />

                <div className="w-full max-w-64 mt-4">
                    <HomePrimaryAction wallet={wallet} />
                </div>

                <PoweredByCrossmint />
            </div>
        </div>
    );
}
