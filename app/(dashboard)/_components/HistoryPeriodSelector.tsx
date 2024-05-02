'use client';
import { getHistoryPeriodResponseType } from '@/app/api/history-periods/route';
import SkeletonWrapper from '@/components/SkeletonWrapper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Period, Timeframe } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

type Props = {
  period: Period;
  setPeriod: (period: Period) => void;
  timeframe: Timeframe;
  setTimeframe: (timeframe: Timeframe) => void;
};

const HistoryPeriodSelector = ({
  period,
  setPeriod,
  timeframe,
  setTimeframe,
}: Props) => {
  const historyPeriod = useQuery<getHistoryPeriodResponseType>({
    queryKey: ['overview', 'history', 'periods'],
    queryFn: async () => {
      const response = await fetch('/api/history-periods');
      return response.json();
    },
  });

  return (
    <div className=' flex flex-wrap items-center gap-4'>
      <SkeletonWrapper isLoading={historyPeriod.isFetching} fullWidth={false}>
        <Tabs
          value={timeframe}
          onValueChange={(value) => setTimeframe(value as Timeframe)}
        >
          <TabsList>
            <TabsTrigger value='year'>Year</TabsTrigger>
            <TabsTrigger value='month'>Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </SkeletonWrapper>
      <div className=' flex flex-wrap items-center gap-2'>
        <SkeletonWrapper isLoading={historyPeriod.isFetching}>
          <YearSelector
            period={period}
            setPeriod={setPeriod}
            years={historyPeriod.data || []}
          />
        </SkeletonWrapper>
      </div>
    </div>
  );
};

export default HistoryPeriodSelector;

function YearSelector({
  period,
  setPeriod,
  years,
}: {
  period: Period;
  setPeriod: (period: Period) => void;
  years: getHistoryPeriodResponseType;
}) {
  return (
    <Select
      value={period.year.toString()}
      onValueChange={(value) => {
        setPeriod({
          year: parseInt(value),
          month: period.month,
        });
      }}
    >
      <SelectTrigger className='w-[180px]'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {years.map((year) => (
          <SelectItem key={year} value={year.toString()}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
