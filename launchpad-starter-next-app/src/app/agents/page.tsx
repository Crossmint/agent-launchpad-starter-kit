"use client";

import { PoweredByCrossmint } from "@/components/powered-by-crossmint";
import { Skeleton } from "@/components/skeleton";
import { useQuery } from "@tanstack/react-query";

import { useWallet } from "../providers/wallet-provider";
import { getMyDeployedAgents } from "../_actions/get-agents";
import AgentCard from "./agent-card";
import { Typography } from "@/components/typography";

export default function Index() {
    const { isLoading } = useWallet();

    const { data, isLoading: isLoadingAgents } = useQuery({
        queryKey: ["agents"],
        queryFn: getMyDeployedAgents,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    if (isLoading || isLoadingAgents) {
        return (
            <div className="p-6 flex h-full w-full items-center  gap-6 justify-center flex-col">
                <div className="w-full flex-col sm:max-w-3xl bg-card rounded-2xl shadow-dropdown min-h-[560px] p-6">
                    <div className="flex flex-col w-full gap-6 py-6">
                        <Skeleton className="w-full h-[282px] rounded-[10px]" />
                    </div>
                </div>
                <PoweredByCrossmint className="pt-6" />
            </div>
        );
    }

    return (
        <div className="p-6 flex h-full w-full items-center pt-6 gap-6 justify-center flex-col">
            <div className="w-full flex-col sm:max-w-3xl bg-card rounded-2xl shadow-dropdown min-h-[664px] p-6">
                <Typography className="text-2xl font-bold">Deployed Agents</Typography>
                <div className="flex flex-col w-full gap-6 py-6">
                    {(data || []).map((agent) => (
                        <AgentCard key={agent.hosted.id} agent={agent} />
                    ))}
                </div>
            </div>
            <PoweredByCrossmint className="pt-6" />
        </div>
    );
}
