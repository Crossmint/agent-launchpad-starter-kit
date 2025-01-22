"use client";

import { Passkey } from "@/icons/passkey";
import { Spinner } from "@/icons/spinner";
import { useState } from "react";

import { useWallet } from "@crossmint/client-sdk-react-ui";

import { Button } from "./button";
import { Typography } from "./typography";
import { useToast } from "./use-toast";

export const DeployAgentButton = ({
    setAgentSuccessfullyDeployed,
}: { setAgentSuccessfullyDeployed: (a: boolean) => void }) => {
    const { wallet } = useWallet();
    const [isLoadingDeploy, setIsLoadingDeploy] = useState(false);
    const { toast } = useToast();

    console.log({ isLoadingDeploy });

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
            if (!wallet) {
                toast({ title: "Error occurred during wallet creation" });
                return;
            }

            await new Promise((resolve) => {
                setTimeout(() => {
                    setAgentSuccessfullyDeployed(true);
                    resolve(true);
                }, 3500);
            });
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
