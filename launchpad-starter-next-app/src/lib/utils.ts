import { APIKeyEnvironmentPrefix, getEnvironmentForKey } from "@crossmint/common-sdk-base";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names into a single string.
 *
 * @param inputs - The class names to combine.
 * @returns The combined class names as a string.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getBaseUrlFromApiKey(apiKey: string) {
    switch (getEnvironmentForKey(apiKey)) {
        case APIKeyEnvironmentPrefix.STAGING:
            return "https://staging.crossmint.com/api/2022-06-09";
        case APIKeyEnvironmentPrefix.PRODUCTION:
            return "https://www.crossmint.com/api/2022-06-09";
        default:
            return "http://localhost:3000/api/2022-06-09";
    }
}
