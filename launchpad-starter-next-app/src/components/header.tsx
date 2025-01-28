"use client";

import type React from "react";
import { LogoutIcon } from "@/icons/logout";
import { Copy, Image as ImageIcon, User, WalletMinimal } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./dropdown-menu";
import { Typography } from "./typography";
import { useToast } from "./use-toast";
import { useWallet } from "@/app/contexts/WalletContext";
import { useAuth } from "@crossmint/client-sdk-react-ui";

function formatWalletAddress(address: string, startLength: number, endLength: number): string {
    return `${address.substring(0, startLength)}...${address.substring(address.length - endLength)}`;
}

export const Header: React.FC = () => {
    const { logout } = useAuth();
    const { wallet, isLoading } = useWallet();
    const { toast } = useToast();

    const handleLogout = () => {
        window.location.reload();
        logout();
    };

    const handleCopyAddress = async () => {
        if (wallet?.address) {
            await navigator.clipboard.writeText(wallet.address);
            toast({ title: "Address copied to clipboard", duration: 5000 });
        }
    };

    return (
        <div className="flex justify-between p-4 items-center">
            <HeaderLogo />
            {wallet != null && wallet.address != null && wallet.address !== "" && (
                <UserMenu
                    wallet={wallet?.address as any}
                    walletStatus={isLoading ? "in-progress" : "loaded"}
                    onLogout={handleLogout}
                    onCopyAddress={handleCopyAddress}
                />
            )}
        </div>
    );
};

const HeaderLogo: React.FC = () => (
    <Link href="/" className="justify-center items-center flex">
        <img src="/agents.png" alt="Agent Launchpad" className="h-10 w-10" />
    </Link>
);

const UserMenu: React.FC<{
    wallet: string | undefined;
    walletStatus: string;
    onLogout: () => void;
    onCopyAddress: () => void;
}> = ({ wallet, walletStatus, onLogout, onCopyAddress }) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={walletStatus !== "loaded"}>
            <div className="flex items-center gap-5 cursor-pointer">
                <WalletDisplay address={wallet} isLoading={walletStatus !== "loaded"} />
                <Avatar className="h-9 w-9">
                    <AvatarImage alt="User Avatar" src="" />
                    <AvatarFallback className="bg-skeleton">
                        <User className="h-5 w-5" />
                    </AvatarFallback>
                </Avatar>
            </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 overflow-y-auto max-h-[80vh]">
            <div className="flex flex-col gap-2">
                <div className="flex gap-3 text-muted items-center cursor-pointer py-2" onClick={onCopyAddress}>
                    <Typography>{wallet ? formatWalletAddress(wallet, 14, 6) : ""}</Typography>
                    <Copy className="h-5 w-5" />
                </div>
                <Link href="/agents" prefetch={false} className="text-secondary-foreground flex gap-3 py-2">
                    <ImageIcon className="h-5 w-5" />
                    <Typography>Agents</Typography>
                </Link>
                <div className="text-secondary-foreground flex gap-3 py-2 cursor-pointer" onClick={onLogout}>
                    <LogoutIcon className="h-5 w-5" />
                    <Typography>Logout</Typography>
                </div>
            </div>
        </DropdownMenuContent>
    </DropdownMenu>
);

const WalletDisplay: React.FC<{
    address: string | undefined;
    isLoading: boolean;
}> = ({ address, isLoading }) => (
    <div className="flex items-center min-w-[150px] bg-skeleton rounded-full px-4 py-2 gap-2 text-secondary-foreground">
        <WalletMinimal className="h-4 w-4" />
        <Typography>{isLoading ? "Loading..." : address ? formatWalletAddress(address, 6, 3) : ""}</Typography>
    </div>
);
