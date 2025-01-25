"use client";

import { PoweredByCrossmint } from "@/components/powered-by-crossmint";
import { Skeleton } from "@/components/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs";
import { Typography } from "@/components/typography";
import { useQuery } from "@tanstack/react-query";

import { MockAgent } from "../service/MockAgent";
import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import { useWallet } from "../contexts/WalletContext";

function getMockAgents() {
    return [
        new MockAgent("1", "Rufus", 100, new Date("2025-01-19T12:00:11Z").toISOString()),
        new MockAgent("2", "Rufus", 2000, new Date("2025-01-16T12:01:50Z").toISOString()),
        new MockAgent("3", "Rufus", 5, new Date("2025-01-13T12:05:21Z").toISOString()),
    ];
}

const SkeletonLoader = () => {
    return (
        <div className="p-6 flex h-full w-full items-center  gap-6 justify-center flex-col">
            <div className="w-full flex-col sm:max-w-[418px] bg-card rounded-2xl shadow-dropdown min-h-[560px] p-6">
                <div className="h-24 rounded-lg border border-border flex flex-col gap-4 items-center justify-center">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex p-8 justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 justify-items-center gap-x-4 gap-y-8 pb-6">
                    <div className="w-full sm:w-auto flex flex-col gap-4">
                        <Skeleton className="w-full h-40 sm:w-40 rounded-[10px]" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="w-full sm:w-auto flex flex-col gap-4">
                        <Skeleton className="w-full h-40 sm:w-40 rounded-[10px]" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="w-full sm:w-auto flex flex-col gap-4">
                        <Skeleton className="w-full h-40 sm:w-40 rounded-[10px]" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="w-full sm:w-auto flex flex-col gap-4">
                        <Skeleton className="w-full h-40 sm:w-40 rounded-[10px]" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
            </div>
            <PoweredByCrossmint className="pt-6" />
        </div>
    );
};

const ElapsedTime = ({ num }: { num: string }) => {
    const [count, setCount] = useState(() => {
        const startTime = new Date(num).getTime() / 1000; // Convert to seconds
        const currentTime = Math.floor(Date.now() / 1000);
        return currentTime - startTime;
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setCount((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return count + "s ago";
};

export default function Index() {
    const { wallet, isLoading } = useWallet();

    const { data, isLoading: isLoadingAgents } = useQuery({
        queryKey: ["agents"],
        queryFn: getMockAgents,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: wallet != null,
    });

    if (isLoading || isLoadingAgents) {
        return <SkeletonLoader />;
    }

    return (
        <div className="p-6 flex h-full w-full items-center pt-6 gap-6 justify-center flex-col">
            <div className="w-full flex-col sm:max-w-[418px] bg-card rounded-2xl shadow-dropdown min-h-[664px] p-6">
                <div className="h-24 rounded-lg border border-border flex flex-col gap-1 items-center justify-center">
                    <Typography className="text-secondary-foreground" variant="h3">
                        Smart Wallet
                    </Typography>
                    <Typography className="text-muted" variant="h3">
                        $0.00
                    </Typography>
                </div>
                <Tabs defaultValue="agents" className="my-2">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="agents">Agents</TabsTrigger>
                        <TabsTrigger value="tokens">Tokens</TabsTrigger>
                    </TabsList>
                    <TabsContent value="agents" className="h-[420px] overflow-y-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 justify-items-center gap-x-4 gap-y-8 py-6">
                            {(data || []).map((agent) => (
                                <div className="flex flex-col gap-4 w-full" key={agent.id}>
                                    <img
                                        className="rounded-[10px] w-[36px] sm:max-w-[164px] self-center"
                                        src={"/agents.png"}
                                        alt={agent.name}
                                    />
                                    <div className="flex flex-col">
                                        <Typography className="text-base text-color-secondary-foreground leading-none">
                                            {agent.name} {`(${agent.id})`}
                                        </Typography>
                                        <Typography className="text-sm text-muted">
                                            <ElapsedTime num={agent.timeStarted} />
                                        </Typography>
                                        <Typography className="text-sm text-muted">{agent.getBalance()}</Typography>
                                        <Button variant="secondary" className="max-h-6">
                                            View
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="tokens" className="h-[420px] overflow-y-auto">
                        <Typography className="text-base text-primary-foreground p-4">
                            {"You have no tokens :("}
                        </Typography>
                    </TabsContent>
                </Tabs>
            </div>
            <PoweredByCrossmint className="pt-6" />
        </div>
    );
}
