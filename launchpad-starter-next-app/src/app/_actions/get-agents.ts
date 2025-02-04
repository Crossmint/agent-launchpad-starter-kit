"use server";

import { TeeCloud } from "@/server/services/phala/tee-cloud";

export async function getMyDeployedAgents() {
    const teeCloud = new TeeCloud();
    return await teeCloud.queryCvmsByUserId();
}
