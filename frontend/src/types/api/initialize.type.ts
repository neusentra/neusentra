type InitializeData = {
    initialized: boolean;
};

export type InitializeStatusApiResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data: InitializeData;
};

export type InitializeSetupApiResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data: unknown;
};
