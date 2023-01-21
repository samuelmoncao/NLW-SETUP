import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { api } from "../lib/axios";
import { generateRangeFromYearBeginning } from "../utils/generate-range-from-year-beginning";
import { HabitDay } from "./HabitDay";

type TSummary = {
  id: string;
  date: string;
  amount: number;
  completed: number;
}

const weekDays = [
  'D',
  'S',
  'T',
  'Q',
  'Q',
  'S',
  'S',
];

const summaryDates = generateRangeFromYearBeginning();

const minimumSummaryDatesSize = 18 * 7;

const amountOfDaysToFill = minimumSummaryDatesSize - summaryDates.length;


export function SummaryTable() {
  const [summary, setSummary] = useState<TSummary[]>([]);

  useEffect(() => {
    api.get<TSummary[]>('summary').then(({ data }) => {
      setSummary(data);
    })
  }, []);

  return (
    <div className="w-full flex">
      <div className="grid grid-rows-7 grid-flow-row gap-3">
        {weekDays.map((weekDay, i) => (
          <div
            key={`${weekDay}-${i}`}
            className="text-zinc-400 text-xl h-10 w-10 font-bold flex items-center justify-center"
          >
            {weekDay}
          </div>
        ))}
      </div>

      <div className="grid grid-rows-7 grid-flow-col gap-3">
        {summary.length > 0 && summaryDates.map(day => {
          const dayInSummary = summary.find(dateSummary => {
            return dayjs(day).isSame(dateSummary.date, 'day');
          });

          return (
            <HabitDay
              key={day.getTime()}
              date={day}
              amount={dayInSummary?.amount}
              defaultCompleted={dayInSummary?.completed}
            />
          );
        })}
        {amountOfDaysToFill > 0 && Array.from({ length: amountOfDaysToFill }).map((_, i) => (
          <div
          key={`${i}`}
          className="w-10 h-10 bg-zinc-900 border-2 border-zinc-800 rounded-lg opacity-40 cursor-not-allowed" />
        ))}
      </div>
    </div>
  );
}