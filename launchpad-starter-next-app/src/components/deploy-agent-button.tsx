"use client";

import { Passkey } from "@/icons/passkey";
import { Spinner } from "@/icons/spinner";
import { useState } from "react";

import { Button } from "./button";
import { Typography } from "./typography";
import { useToast } from "./use-toast";
import { useWallet } from "@/app/contexts/WalletContext";
import { handleRegisterAndApproveDelegate, handleSignMessage } from "@/app/_lib/wallet-ops";

export const DeployAgentButton = ({
    setAgentSuccessfullyDeployed,
}: { setAgentSuccessfullyDeployed: (a: boolean) => void }) => {
    const { wallet } = useWallet();
    const [isLoadingDeploy, setIsLoadingDeploy] = useState(false);
    const { toast } = useToast();

    if (isLoadingDeploy) {
        return (
            <div className="flex gap-2 items-center self-center min-h-[52px]" role="status">
                <Spinner />
                <Typography className="text-primary-foreground" variant={"h4"}>
                    Deploying Rufus...
                </Typography>
            </div>
        );
    }

    const handleDeployAgent = async () => {
        setIsLoadingDeploy(true);
        try {
            if (!wallet?.address) {
                toast({ title: "Error occurred during wallet creation" });
                return;
            }

            // 1. Deploy the agent
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_TEE_SERVER_URL}/api/deploy?smartWalletAddress=${wallet.address}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            const data = await response.json();
            console.log({ data });

            // // 2. Sign the signature
            const signedSignature = await handleSignMessage(wallet.address, wallet.credentialId);
            console.log({ signedSignature });

            // 3. Register and approve the delegate
            await handleRegisterAndApproveDelegate(wallet.address, wallet.credentialId, data.message, data.id);

            setAgentSuccessfullyDeployed(true);
        } catch (error) {
            console.error("Error deploying Rufus:", error);
            toast({ title: "Error occurred during deployment" });
        } finally {
            setIsLoadingDeploy(false);
        }
    };

    return (
        <Button
            className="bg-background rounded-full text-secondary-foreground font-semibold text-[17px] gap-2 shadow-primary border border-color-secondary-foreground"
            onClick={handleDeployAgent}
            disabled={isLoadingDeploy}
        >
            <div
                style={{
                    display: "flex",
                    gap: 8,
                    background: "linear-gradient(to right, #1B2C60, #7d98eb)",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                }}
            >
                <Passkey />
                <Typography className="text-[17px] pt-[0.5px]">Deploy Rufus</Typography>
            </div>
        </Button>
    );
};
