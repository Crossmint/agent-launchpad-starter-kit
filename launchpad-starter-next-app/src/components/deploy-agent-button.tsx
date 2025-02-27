"use client";

import { useEffect, useState } from "react";
import { Passkey } from "@/icons/passkey";
import { Spinner } from "@/icons/spinner";
import { WebAuthnP256 } from "ox";

import { Button } from "./button";
import { Typography } from "./typography";
import { useToast } from "./use-toast";
import { useWallet } from "@/app/providers/wallet-provider";
import { submitSignatureApproval } from "@/app/_actions/submit-signature-approval";

export const DeployAgentButton = ({
    setAgentSuccessfullyDeployed,
}: { setAgentSuccessfullyDeployed: (a: boolean) => void }) => {
    const { wallet } = useWallet();
    const [isLoadingDeploy, setIsLoadingDeploy] = useState(false);
    const { toast } = useToast();

    if (isLoadingDeploy) {
        return (
            <div className="w-full flex gap-2 items-center self-center min-h-[52px]" role="status">
                <Spinner />
                <Typography className="text-primary-foreground" variant={"h4"}>
                    Deploying Rufus...
                    <Timer />
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

            const walletSignerType = wallet.type.includes("solana") ? "solana-keypair" : "evm-keypair";

            // 1. Deploy the agent
            const response = await fetch(`/api/deploy`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ smartWalletAddress: wallet.address, walletSignerType }),
            });

            const data = (await response.json()) as {
                success: true;
                containerId: string;
                delegatedSignerMessage: string;
                delegatedSignerId: string;
                delegatedSignerAlreadyActive?: boolean;
            };

            console.log({ data });

            // If the delegated signer is already active, we can skip the signature approval step
            if (data?.delegatedSignerAlreadyActive) {
                setAgentSuccessfullyDeployed(true);
                return;
            }

            // 2. Sign the delegated signer message that was returned from the server
            let signature;
            let metadata;

            if (!walletSignerType.includes("solana")) {
                // EVM passkey wallet uses WebAuthn (passkeys)
                const { metadata: webAuthnMetadata, signature: webAuthnSignature } = await WebAuthnP256.sign({
                    credentialId: wallet.credentialId,
                    challenge: data.delegatedSignerMessage as `0x${string}`,
                });
                signature = { r: webAuthnSignature.r.toString(), s: webAuthnSignature.s.toString() };
                metadata = webAuthnMetadata;
            } else {
                // TODO: Implement Solana signature approval
            }
            // 3. call the server-side action to submit the signature approval
            await submitSignatureApproval(
                signature,
                `${walletSignerType}:${wallet.credentialId}`,
                wallet.address,
                data.delegatedSignerId,
                metadata
            );

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
            className="w-full bg-background rounded-full text-secondary-foreground font-semibold text-[17px] gap-2 shadow-primary border border-color-secondary-foreground"
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

const Timer = () => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCount((prevCount) => prevCount + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return count + "s";
};
