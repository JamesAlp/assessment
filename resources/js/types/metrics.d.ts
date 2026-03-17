interface KeyValuePair {
    label: string;
    value: number;
}

export interface MonthlySales extends KeyValuePair {}

export interface OpenDeals extends KeyValuePair {}

export interface ActiveAccounts extends KeyValuePair {}

export interface DailySales {
    label: string;
    values: Record<string, number>;
}

export type MetricLoadingState = 'Loading' | 'Success' | 'Failure';
