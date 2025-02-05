"use server";

import { PhalaCloud } from "@/server/services/phala/phala-cloud";

export async function getMyDeployedAgents() {
    const phalaCloud = new PhalaCloud();
    return await phalaCloud.queryCvmsByUserId();
}
