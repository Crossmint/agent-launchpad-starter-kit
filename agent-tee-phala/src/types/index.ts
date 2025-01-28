export interface DerivedKeys {
    key: string;
    timestamp: string;
}

export interface DerivedKeysResponse {
    success: boolean;
    data: DerivedKeys;
    containerId: string;
}
