<script setup lang="ts">
import { useAppearance } from '@/composables/useAppearance';
import { currencyFormatter } from '@/lib/utils';
import { DailySales as LineSeriesData } from '@/types/metrics';
import { ApexAxisChartSeries, ApexOptions } from 'apexcharts';
import { computed, ref } from 'vue';
import VueApexCharts from 'vue3-apexcharts';

// Over time this component could be built out to handle a larger amount
// of line chart needs such as multiple lines, different line styles, etc.
const props = defineProps<{
    lineSeriesData: LineSeriesData;
    dataPointLabel: string;
}>();

const { appearance } = useAppearance();

// in a larger or official project these would usually
// be configured on some application configuration level.
const locale = ref('en-US');
const currency = ref('USD');

/**
 * Constructs series data from daily sales to work within Apex Charts' Line Chart component.
 */
const dailySalesSeries = computed<ApexAxisChartSeries>(() => {
    const sorted = Object.entries(props.lineSeriesData.values).sort((a, b) =>
        a[0].localeCompare(b[0]),
    );

    return [
        {
            name: props.dataPointLabel ?? 'series-1',
            data: sorted.map((salesPoint: [string, number]) => ({
                x: new Date(salesPoint[0]),
                y: salesPoint[1],
            })),
        },
    ];
});

/**
 * Constructs chart options to work within Apex Charts' Line Chart component.
 */
const chartOptions = computed<ApexOptions>(() => {
    const mode = () => {
        switch (appearance.value) {
            case 'system':
                // guard in case of SSR contexts
                if (typeof window === 'undefined') return 'dark';

                // if value is 'system' check user's preference.
                const prefersDark = window.matchMedia(
                    '(prefers-color-scheme: dark)',
                ).matches;

                if (prefersDark) {
                    return 'dark';
                }
                return 'light';
            case 'light':
                return 'light';
            case 'dark':
                return 'dark';
            default:
                return 'light';
        }
    };

    return {
        theme: {
            mode: mode(),
        },
        tooltip: {
            y: {
                formatter: (value: number) =>
                    currencyFormatter(locale.value, currency.value).format(
                        value,
                    ),
            },
        },
        stroke: { curve: 'straight' },
        xaxis: { type: 'datetime' },
        plotOptions: {
            line: {
                colors: {
                    // given more time i'd try to find a way to make any
                    // upward line green and any downward line red
                    // but i believe for now a threshold value gets the
                    // idea across
                    threshold: 8000,
                    colorAboveThreshold: '#00c951',
                    colorBelowThreshold: '#ff0000',
                },
            },
        },
        markers: {
            size: 5,
            // strokeColors: '#000',
            // strokeWidth: 1,
            strokeOpacity: 0.9,
            strokeDashArray: 0,
            fillOpacity: 0.5,
            discrete: [],
            shape: 'circle',
            offsetX: 0,
            offsetY: 0,
            showNullDataPoints: true,
            hover: {
                sizeOffset: 5,
            },
        },
    };
});

/**
 * Force re-mount on series data change to prevent issues with multiple series data
 * being cached / displayed.
 */
const chartKey = computed(() => {
    const dates = Object.keys(props.lineSeriesData.values).sort();
    return `${dates[0] ?? ''}-${dates[dates.length - 1] ?? ''}-${dates.length}`;
});
</script>

<template>
    <VueApexCharts
        :key="chartKey"
        type="line"
        height="320"
        class="w-full"
        :options="chartOptions"
        :series="dailySalesSeries"
    />
</template>
