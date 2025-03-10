import { CrossmintLeaf } from "@/icons/crossmint-leaf";
import { cn } from "@/lib/utils";

import { Typography } from "./typography";

export const PoweredByCrossmint = ({ className }: { className?: string }) => {
    return (
        <Typography
            variant={"h4"}
            className={cn(
                "flex text-sm text-primary-foreground font-semibold -tracking-[0.9px] self-center p-2 pb-12",
                className
            )}
        >
            <span className="self-center pr-1 pl-1.5">
                <CrossmintLeaf />
            </span>
            Secured by Crossmint
        </Typography>
    );
};
