interface KeyValuePair {
    label: string;
    value: number;
}

export type MonthlySales = KeyValuePair;

export type OpenDeals = KeyValuePair;

export type ActiveAccounts = KeyValuePair;

export interface DailySales {
    label: string;
    values: Record<string, number>;
}

export type MetricLoadingState = 'Loading' | 'Success' | 'Failure';
