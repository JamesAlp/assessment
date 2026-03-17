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

// given more time I would evaluate the idea of combining this state in some maner
// such as combining the data and loading status for each metric together
// or storing all state in larger overall state store that I would populate dynamically
// from the 4 predefined metrics that are used. However given that this is a take-home
// assessment and that there are only 4 predefined metrics to consider, I believe this
// is fine.

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
const dailySalesSelectedRange = ref<DateRange>();
watch(dailySalesSelectedRange, (range) => {
    if (range?.start && range?.end) {
        loadDailySales(range);
    }
});

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
 *
 * Given more time I'd look for a way to cache data through a store to avoid duplicate API calls.
 * I'd also add debouncing to avoid spamming API calls and use AbortController to avoid race conditions.
 */
const loadDailySales = async (dateRange?: DateRange) => {
    try {
        const todaysDate = today(getLocalTimeZone());
        const range: DateRange = {
            start: todaysDate.subtract({ days: 30 }),
            end: todaysDate,
        };

        if (dateRange && dateRange.start && dateRange.end) {
            range.start = dateRange.start;
            range.end = dateRange.end;
        }

        dailySalesData.value = await fetchMetric<DailySales>(
            MetricsController.dailySales.url({
                query: {
                    ...(range.start
                        ? { start_date: range.start.toString() }
                        : {}),
                    ...(range.end ? { end_date: range.end.toString() } : {}),
                },
            }),
            'GET',
        );
        dailySalesLoadingStatus.value = 'Success';
    } catch (err) {
        dailySalesLoadingStatus.value = 'Failure';
        console.error(`Failed to load daily sales`, err);
    }
};

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
                    <!-- Given more time I'd look into this whole settings modal / dropdown menu area and clean it up. For now I am just demonstrating the idea. -->
                    <CardAction>
                        <DropdownMenu>
                            <DropdownMenuTrigger as-child>
                                <Settings class="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent class="h-102 w-145">
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
