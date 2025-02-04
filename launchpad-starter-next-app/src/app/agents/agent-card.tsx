import { Typography } from "@/components/typography";
import { Button } from "@/components/button";
import type { Cvm } from "../types/phala";

export default function AgentCard({ agent }: { agent: Cvm }) {
    return (
        <div className="flex flex-col gap-4 w-full border border-border rounded-lg p-4" key={agent.hosted.id}>
            <div className="flex justify-between flex-wrap items-start">
                <div className="flex flex-col">
                    <Typography className="text-lg font-semibold text-color-secondary-foreground">
                        {agent.hosted.name}
                    </Typography>
                    <Typography className="text-sm text-muted">ID: {agent.hosted.id}</Typography>
                    <Typography className="text-sm text-muted">Instance ID: {agent.hosted.instance_id}</Typography>
                </div>
                <div className="flex items-center gap-2">
                    <div
                        className={`w-2 h-2 rounded-full ${
                            agent.status === "running" ? "bg-green-500" : "bg-yellow-500"
                        }`}
                    />
                    <Typography className="text-sm capitalize">{agent.status}</Typography>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Typography className="text-sm text-muted">Uptime</Typography>
                    <Typography className="text-sm">{agent.hosted.uptime}</Typography>
                </div>
                <div>
                    <Typography className="text-sm text-muted">Node</Typography>
                    <Typography className="text-sm">{agent.node.name}</Typography>
                </div>
                <div>
                    <Typography className="text-sm text-muted">Memory</Typography>
                    <Typography className="text-sm">{agent.hosted.configuration.memory}MB</Typography>
                </div>
                <div>
                    <Typography className="text-sm text-muted">vCPU</Typography>
                    <Typography className="text-sm">{agent.hosted.configuration.vcpu}</Typography>
                </div>
            </div>

            <div className="flex gap-2">
                <Button
                    variant="secondary"
                    className="text-sm"
                    onClick={() => window.open(agent.dapp_dashboard_url, "_blank")}
                >
                    Dashboard
                </Button>
                <Button
                    variant="secondary"
                    className="text-sm"
                    onClick={() => window.open(agent.syslog_endpoint, "_blank")}
                >
                    Logs
                </Button>
            </div>
        </div>
    );
}
