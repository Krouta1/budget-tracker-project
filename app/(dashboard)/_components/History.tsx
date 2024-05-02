'use client';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { GetFormatterForCurrency } from '@/lib/helpers';
import { Period, Timeframe } from '@/lib/types';
import { UserSettings } from '@prisma/client';
import React, { useMemo, useState } from 'react';
import HistoryPeriodSelector from './HistoryPeriodSelector';

type Props = {
  userSettings: UserSettings;
};

const History = ({ userSettings }: Props) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('month');
  const [period, setPeriod] = useState<Period>({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  });

  const formatter = useMemo(() => {
    return GetFormatterForCurrency(userSettings.currency);
  }, [userSettings.currency]);

  return (
    <div className=' container'>
      <h2 className=' mt-12 text-3xl font-bold'>
        <Card className=' col-span-12 mt-2 w-full'>
          <CardHeader className=' gap-2'>
            <CardTitle className=' grid grid-flow-row justify-between gap-2 md:grid-flow-col'>
              <HistoryPeriodSelector
                period={period}
                setPeriod={setPeriod}
                timeframe={timeframe}
                setTimeframe={setTimeframe}
              />
              <div className=' flex h-10 gap-2'>
                <Badge
                  variant={'outline'}
                  className=' flex items-center gap-2 text-sm'
                >
                  <div className=' h-4 w-4 rounded-full bg-emerald-500' />
                  Income
                </Badge>
                <Badge
                  variant={'outline'}
                  className=' flex items-center gap-2 text-sm'
                >
                  <div className=' h-4 w-4 rounded-full bg-rose-500' />
                  Expanse
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
      </h2>
    </div>
  );
};

export default History;
