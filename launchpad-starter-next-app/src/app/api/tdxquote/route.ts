// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { TappdClient } from "@phala/dstack-sdk";
import "dotenv/config";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const endpoint = process.env.DSTACK_SIMULATOR_ENDPOINT || "http://localhost:8090";

export async function GET() {
    // Get Tappd client
    const client = new TappdClient(endpoint);
    const randomNumString = Math.random().toString();
    // Generate Remote Attestation Quote based on a random string of data
    const getRemoteAttestation = await client.tdxQuote(randomNumString);
    // Return Remote Attestation result
    return NextResponse.json({ getRemoteAttestation });
}
