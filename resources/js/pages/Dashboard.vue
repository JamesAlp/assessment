<script setup lang="ts">
import MetricsController from '@/actions/App/Http/Controllers/MetricsController';
import LineChart from '@/components/charts/LineChart.vue';
import MetricCard from '@/components/dashboard/MetricCard.vue';
import CardAction from '@/components/ui/card/CardAction.vue';
import DatePicker from '@/components/ui/date-picker/DatePicker.vue';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/AppLayout.vue';
import { fetchMetric } from '@/lib/utils';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import {
    ActiveAccounts,
    DailySales,
    MetricLoadingState,
    MonthlySales,
    OpenDeals,
} from '@/types/metrics';
import { Head } from '@inertiajs/vue3';
import { getLocalTimeZone, today } from '@internationalized/date';
import { Settings } from 'lucide-vue-next';
import { DateRange } from 'reka-ui';
import { onMounted, ref, watch } from 'vue';
import CountUp from 'vue-countup-v3';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

/**
 * Overall sales data for the current month.
 */
const monthlySalesData = ref<MonthlySales>();
const monthlySalesLoadingStatus = ref<MetricLoadingState>('Loading');

/**
 * Number of active deals.
 */
const openDealsData = ref<OpenDeals>();
const openDealsLoadingStatus = ref<MetricLoadingState>('Loading');

/**
 * Number of active accounts.
 */
const activeAccountsData = ref<ActiveAccounts>();
const activeAccountsLoadingStatus = ref<MetricLoadingState>('Loading');

/**
 * Daily sales points over specified period of time, default 30 days.
 */
const dailySalesData = ref<DailySales>();
const dailySalesLoadingStatus = ref<MetricLoadingState>('Loading');
const todaysDate = today(getLocalTimeZone());
const dailySalesSelectedRange = ref<DateRange>({
    start: todaysDate.subtract({ days: 29 }),
    end: todaysDate,
});
// watch(dailySalesSelectedRange, (range) => {
//     if (range?.start && range?.end) {
//         dailySalesSelectedRange.value.start = range.start;
//         dailySalesSelectedRange.value.end = range.end;
//         loadDailySales();
//     }
// });

/**
 * Loads monthly sales.
 */
const loadMonthlySales = async () => {
    try {
        monthlySalesData.value = await fetchMetric<MonthlySales>(
            MetricsController.monthlySales.url(),
            'GET',
        );
        monthlySalesLoadingStatus.value = 'Success';
    } catch (err) {
        monthlySalesLoadingStatus.value = 'Failure';
        console.error(`Failed to load monthly sales`, err);
    }
};

/**
 * Loads open deals.
 */
const loadOpenDeals = async () => {
    try {
        openDealsData.value = await fetchMetric<OpenDeals>(
            MetricsController.openDeals.url(),
            'GET',
        );
        openDealsLoadingStatus.value = 'Success';
    } catch (err) {
        openDealsLoadingStatus.value = 'Failure';
        console.error(`Failed to load open deals`, err);
    }
};

/**
 * Loads active accounts.
 */
const loadActiveAccounts = async () => {
    try {
        activeAccountsData.value = await fetchMetric<ActiveAccounts>(
            MetricsController.activeAccounts.url(),
            'GET',
        );
        activeAccountsLoadingStatus.value = 'Success';
    } catch (err) {
        activeAccountsLoadingStatus.value = 'Failure';
        console.error(`Failed to load active accounts`, err);
    }
};

/**
 * Loads daily sales, default by 30 days period.'
 */
const loadDailySales = async (signal?: AbortSignal) => {
    try {
        dailySalesData.value = await fetchMetric<DailySales>(
            MetricsController.dailySales.url({
                query: {
                    ...(dailySalesSelectedRange.value.start
                        ? {
                              start_date:
                                  dailySalesSelectedRange.value.start.toString(),
                          }
                        : {}),
                    ...(dailySalesSelectedRange.value.end
                        ? {
                              end_date:
                                  dailySalesSelectedRange.value.end.toString(),
                          }
                        : {}),
                },
            }),
            'GET',
            signal,
        );
        dailySalesLoadingStatus.value = 'Success';
    } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        dailySalesLoadingStatus.value = 'Failure';
        console.error(`Failed to load daily sales`, err);
    }
};

watch(
    () => [
        dailySalesSelectedRange.value.start?.toString(),
        dailySalesSelectedRange.value.end?.toString(),
    ],
    ([start, end], old, onCleanup) => {
        if (!start || !end) return;

        const controller = new AbortController();
        loadDailySales(controller.signal);
        onCleanup(() => controller.abort);
    },
    { immediate: true },
);

/**
 * Get each metric async.
 */
onMounted(() => {
    loadMonthlySales();
    loadOpenDeals();
    loadActiveAccounts();
    loadDailySales();
});
</script>

<template>
    <Head title="Dashboard" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div
            class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
        >
            <div class="grid auto-rows-min gap-4 md:grid-cols-3">
                <MetricCard
                    :loading-state="monthlySalesLoadingStatus"
                    :title="monthlySalesData?.label ?? 'Monthly Sales'"
                    description="Current month total."
                >
                    <count-up
                        v-if="monthlySalesData?.value != null"
                        class="text-base leading-none font-semibold tracking-tight text-green-500 tabular-nums max-sm:text-3xl sm:text-lg lg:text-2xl xl:text-3xl"
                        :decimal-places="2"
                        :end-val="monthlySalesData?.value"
                        :options="{
                            prefix: '$',
                            separator: ',',
                            useGrouping: true,
                        }"
                    ></count-up>
                </MetricCard>

                <MetricCard
                    :loading-state="openDealsLoadingStatus"
                    :title="openDealsData?.label ?? 'Open Deals'"
                    description="All available deals."
                >
                    <p
                        v-if="openDealsData"
                        class="text-base leading-none font-semibold tracking-tight text-green-500 tabular-nums max-sm:text-3xl sm:text-lg lg:text-2xl xl:text-3xl"
                    >
                        {{ openDealsData?.value }}
                    </p>
                </MetricCard>

                <MetricCard
                    :loading-state="activeAccountsLoadingStatus"
                    :title="activeAccountsData?.label ?? 'Active Accounts'"
                    description="Accounts with recent activity."
                >
                    <p
                        v-if="activeAccountsData"
                        class="text-base leading-none font-semibold tracking-tight text-green-500 tabular-nums max-sm:text-3xl sm:text-lg lg:text-2xl xl:text-3xl"
                    >
                        {{ activeAccountsData?.value }}
                    </p>
                </MetricCard>
            </div>

            <MetricCard
                :loading-state="dailySalesLoadingStatus"
                :title="dailySalesData?.label ?? 'Daily Sales'"
                description="Sales per day."
            >
                <template #header>
                    <CardAction>
                        <DropdownMenu>
                            <DropdownMenuTrigger as-child>
                                <button
                                    type="button"
                                    aria-label="Chart settings"
                                    class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md hover:bg-accent"
                                >
                                    <Settings class="h-4 w-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                class="max-h-[80vh] max-w-[90vw] overflow-auto"
                            >
                                <DatePicker
                                    v-model:selected-range="
                                        dailySalesSelectedRange
                                    "
                                />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardAction>
                </template>

                <LineChart
                    v-if="dailySalesData"
                    :lineSeriesData="dailySalesData"
                    data-point-label="Daily Total"
                />
            </MetricCard>
        </div>
    </AppLayout>
</template>
