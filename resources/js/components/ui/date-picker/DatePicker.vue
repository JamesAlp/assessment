<script setup lang="ts">
import type { DateRange } from 'reka-ui'
import { Icon } from '@iconify/vue'
import { getLocalTimeZone, today } from '@internationalized/date'
import { DateRangeFieldInput, DateRangeFieldRoot, RangeCalendarCell, RangeCalendarCellTrigger, RangeCalendarGrid, RangeCalendarGridBody, RangeCalendarGridHead, RangeCalendarGridRow, RangeCalendarHeadCell, RangeCalendarNext, RangeCalendarPrev, RangeCalendarRoot, useDateFormatter } from 'reka-ui'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{
  selectedRange?: DateRange
}>();

const selectedRange = computed({
  get: () => props.selectedRange,
  set: (value) => emit('update:selectedRange', value)
})

const emit = defineEmits<{
  (e: 'update:selectedRange', value: DateRange | undefined): void
}>();

const isDesktop = ref(false)
let mediaQuery: MediaQueryList | null = null

const syncViewportMode = () => {
  isDesktop.value = mediaQuery?.matches ?? false
}
const numberOfMonths = computed(() => (isDesktop.value ? 2 : 1))
const formatter = useDateFormatter('en-UK')

// const selectedRange = ref<DateRange>()

const quickOptions = [
  {
    label: 'Today',
    action: () => {
      const _today = today(getLocalTimeZone())
      selectedRange.value = {
        start: _today,
        end: _today,
      }
    },
  },
  {
    label: 'Yesterday',
    action: () => {
      const yesterday = today(getLocalTimeZone()).subtract({ days: 1 })
      selectedRange.value = {
        start: yesterday,
        end: yesterday,
      }
    },
  },
  {
    label: 'Last 7 days',
    action: () => {
      selectedRange.value = {
        start: today(getLocalTimeZone()).subtract({ days: 6 }),
        end: today(getLocalTimeZone()),
      }
    },
  },
  {
    label: 'Last 30 days',
    action: () => {
      selectedRange.value = {
        start: today(getLocalTimeZone()).subtract({ days: 29 }),
        end: today(getLocalTimeZone()),
      }
    },
  },
  {
    label: 'This month',
    action: () => {
      const now = today(getLocalTimeZone())
      const startOfMonth = now.set({ day: 1 })
      selectedRange.value = {
        start: startOfMonth,
        end: now,
      }
    },
  },
  {
    label: 'Last month',
    action: () => {
      const now = today(getLocalTimeZone())
      const lastMonth = now.subtract({ months: 1 })
      const startOfLastMonth = lastMonth.set({ day: 1 })
      const endOfLastMonth = startOfLastMonth.add({ months: 1 }).subtract({ days: 1 })
      selectedRange.value = {
        start: startOfLastMonth,
        end: endOfLastMonth,
      }
    },
  },
  {
    label: 'This quarter',
    action: () => {
      const now = today(getLocalTimeZone())
      const quarterStartMonth = Math.floor((now.month - 1) / 3) * 3 + 1
      const startOfQuarter = now.set({ month: quarterStartMonth, day: 1 })

      selectedRange.value = {
        start: startOfQuarter,
        end: now,
      }
    },
  },
  {
    label: 'Last quarter',
    action: () => {
      const now = today(getLocalTimeZone())
      const quarterStartMonth = Math.floor((now.month - 1) / 3) * 3 + 1
      const startOfThisQuarter = now.set({ month: quarterStartMonth, day: 1 })

      const startOfLastQuarter = startOfThisQuarter.subtract({ months: 3 })
      const endOfLastQuarter = startOfThisQuarter.subtract({ days: 1 })

      selectedRange.value = {
        start: startOfLastQuarter,
        end: endOfLastQuarter,
      }
    },
  },
  {
    label: 'This year',
    action: () => {
      const now = today(getLocalTimeZone())
      const startOfYear = now.set({ month: 1, day: 1 })
      selectedRange.value = {
        start: startOfYear,
        end: now,
      }
    },
  },
  {
    label: 'Last year',
    action: () => {
      const now = today(getLocalTimeZone())
      const lastYear = now.subtract({ years: 1 })
      const startOfLastYear = lastYear.set({ month: 1, day: 1 })
      const endOfLastYear = startOfLastYear.add({ years: 1 }).subtract({ days: 1 })

      selectedRange.value = {
        start: startOfLastYear,
        end: endOfLastYear,
      }
    },
  },
]

onMounted(() => {
  if (typeof window !== 'undefined') {
    mediaQuery = window.matchMedia('(min-width: 1024px)')
    syncViewportMode()
    mediaQuery.addEventListener('change', syncViewportMode)
  }

  if (props.selectedRange?.start && props.selectedRange?.end)
    return

  quickOptions.find(option => option.label === 'Last 30 days')?.action()
})

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', syncViewportMode)
})
</script>

<template>
  <div class="flex flex-col rounded-xl border border-border bg-card text-card-foreground shadow-sm lg:flex-row">
    <div class="border-border p-3 sm:p-4 lg:w-40 lg:border-r">
      <div class="flex gap-2 overflow-x-auto lg:block lg:space-y-1">
        <button
          v-for="option in quickOptions"
          :key="option.label"
          class="shrink-0 whitespace-nowrap rounded-md bg-transparent px-3 py-2 text-[13px] text-foreground transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:w-full lg:text-left"
          @click="option.action"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
    <div class="min-w-0 flex-1">
      <RangeCalendarRoot
        v-slot="{ weekDays, grid }"
        v-model="selectedRange"
        class="flex flex-col p-3 sm:p-4 lg:flex-row lg:space-x-4"
        fixed-weeks
        :number-of-months="numberOfMonths"
        locale="en-UK"
      >
        <div
          v-for="(month, index) in grid"
          :key="month.value.toString()"
          :class="index === 0 ? 'lg:mr-4' : ''"
        >
          <div
            v-if="index === 0"
            class="flex items-center"
          >
            <RangeCalendarPrev
              class="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-transparent text-foreground hover:bg-accent active:scale-98 active:transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon
                icon="radix-icons:chevron-left"
                class="w-4 h-4"
              />
            </RangeCalendarPrev>
            <span class="font-semibold flex-1 text-center">{{ formatter.custom(month.value.toDate(getLocalTimeZone()), { month: 'long', year: 'numeric' }) }}</span>
            <RangeCalendarNext
              v-if="grid.length === 1"
              class="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-transparent text-foreground hover:bg-accent active:scale-98 active:transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon
                icon="radix-icons:chevron-right"
                class="w-4 h-4"
              />
            </RangeCalendarNext>
            <span
              v-else
              class="w-7"
            />
          </div>
          <div
            v-if="grid.length > 1 && index === (grid.length - 1)"
            class="flex items-center"
          >
            <span class="w-7" />
            <span class="font-semibold flex-1 text-center">{{ formatter.custom(month.value.toDate(getLocalTimeZone()), { month: 'long', year: 'numeric' }) }}</span>
            <RangeCalendarNext
              class="place-self-end inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-transparent text-foreground hover:bg-accent active:scale-98 active:transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon
                icon="radix-icons:chevron-right"
                class="w-4 h-4"
              />
            </RangeCalendarNext>
          </div>
          <div class="flex flex-col space-y-4 pt-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <RangeCalendarGrid
              class="w-full border-collapse select-none space-y-1"
            >
              <RangeCalendarGridHead>
                <RangeCalendarGridRow class="mb-1 grid w-full grid-cols-7">
                  <RangeCalendarHeadCell
                    v-for="day in weekDays"
                    :key="day"
                    class="rounded-md text-xs text-muted-foreground"
                  >
                    {{ day }}
                  </RangeCalendarHeadCell>
                </RangeCalendarGridRow>
              </RangeCalendarGridHead>
              <RangeCalendarGridBody class="grid">
                <RangeCalendarGridRow
                  v-for="(weekDates, rowIndex) in month.rows"
                  :key="`weekDate-${rowIndex}`"
                  class="grid grid-cols-7"
                >
                  <RangeCalendarCell
                    v-for="weekDate in weekDates"
                    :key="weekDate.toString()"
                    :date="weekDate"
                    class="aspect-square lg:w-[34px] my-0.5 p-0 first:[&:has([data-selected])]:rounded-l-full last:[&:has([data-selected])]:rounded-r-full [&:has([data-selected][data-selection-end])]:rounded-r-full [&:not(:has([data-highlighted])):has([data-selected][data-selection-start])]:rounded-l-full
                 first:[&:has([data-highlighted])]:rounded-l-full last:[&:has([data-highlighted])]:rounded-r-full [&:has([data-highlighted-end])]:rounded-r-full [&:has([data-highlighted-start])]:rounded-l-full
                  [&:has([data-selected])]:bg-green-100 dark:[&:has([data-selected])]:bg-green-900/45 [&:has([data-highlighted])]:bg-green-100 dark:[&:has([data-highlighted])]:bg-green-900/35
                "
                  >
                    <RangeCalendarCellTrigger
                      :day="weekDate"
                      :month="month.value"
                      class="relative flex h-full w-full items-center justify-center whitespace-nowrap rounded-full text-sm font-normal text-foreground outline-none transition duration-100 hover:bg-green-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[selection-start]:bg-green-600 data-[selection-end]:bg-green-600 data-[selection-start]:text-white data-[selection-end]:text-white dark:data-[selection-start]:bg-green-500 dark:data-[selection-end]:bg-green-500 data-[highlighted-start]:bg-green-600 data-[highlighted-start]:text-white data-[highlighted-end]:bg-green-600 data-[highlighted-end]:text-white dark:data-[highlighted-start]:bg-green-500 dark:data-[highlighted-end]:bg-green-500 data-[unavailable]:pointer-events-none data-[unavailable]:text-muted-foreground/40 data-[unavailable]:line-through before:absolute before:bottom-[3px] before:hidden before:h-1 before:w-1 before:rounded-full before:bg-white data-[today]:before:block data-[today]:before:bg-green-700 dark:data-[today]:before:bg-green-400 data-[outside-month]:opacity-25"
                    />
                  </RangeCalendarCell>
                </RangeCalendarGridRow>
              </RangeCalendarGridBody>
            </RangeCalendarGrid>
          </div>
        </div>
      </RangeCalendarRoot>

      <DateRangeFieldRoot
        v-slot="{ segments }"
        v-model="selectedRange"
        locale="en-UK"
        class="flex flex-wrap items-center gap-2 border-t border-border p-3 select-none sm:flex-nowrap sm:gap-0 sm:p-4"
      >
        <div class="flex items-center rounded-md border border-input bg-background p-1 shadow-sm [[data-invalid]_&]:border-red-500">
          <template
            v-for="item in segments.start"
            :key="item.part"
          >
            <DateRangeFieldInput
              v-if="item.part === 'literal'"
              :part="item.part"
              type="start"
            >
              {{ item.value }}
            </DateRangeFieldInput>
            <DateRangeFieldInput
              v-else
              :part="item.part"
              class="whitespace-nowrap rounded p-0.5 text-center text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[placeholder]:text-muted-foreground"
              :class="[item.part === 'year' ? 'w-12' : 'w-8']"
              type="start"
            >
              {{ item.value }}
            </DateRangeFieldInput>
          </template>
        </div>

        <span class="mx-2">-</span>

        <div class="flex items-center rounded-md border border-input bg-background p-1 shadow-sm [[data-invalid]_&]:border-red-500">
          <template
            v-for="item in segments.end"
            :key="item.part"
          >
            <DateRangeFieldInput
              v-if="item.part === 'literal'"
              :part="item.part"
              type="end"
            >
              {{ item.value }}
            </DateRangeFieldInput>
            <DateRangeFieldInput
              v-else
              :part="item.part"
              class="whitespace-nowrap rounded p-0.5 text-center text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[placeholder]:text-muted-foreground"
              :class="[item.part === 'year' ? 'w-12' : 'w-8']"
              type="end"
            >
              {{ item.value }}
            </DateRangeFieldInput>
          </template>
        </div>

        <span class="hidden text-sm font-semibold text-red-500 [[data-invalid]_&]:block sm:ml-4">Invalid date</span>
      </DateRangeFieldRoot>
    </div>
  </div>
</template>
