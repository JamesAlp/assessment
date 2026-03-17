<script setup lang="ts">
import { MetricLoadingState } from '@/types/metrics';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../ui/card';

const props = defineProps<{
    title: string;
    description: string;
    loadingState: MetricLoadingState;
}>();
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle>{{ props.title }}</CardTitle>
            <CardDescription>{{ props.description }}</CardDescription>
            <slot name="header" />
        </CardHeader>
        <CardContent>
            <slot v-if="props.loadingState === 'Success'" />

            <p
                v-else-if="props.loadingState === 'Loading'"
                class="text-muted-foreground"
            >
                Loading...
            </p>

            <p
                v-else-if="props.loadingState === 'Failure'"
                class="text-red-500"
            >
                Failed to load metric.
            </p>
        </CardContent>
    </Card>
</template>
