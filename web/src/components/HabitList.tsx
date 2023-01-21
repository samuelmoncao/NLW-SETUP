import * as Checkbox from '@radix-ui/react-checkbox';
import dayjs from 'dayjs';
import { Check } from 'phosphor-react';
import { useEffect, useState } from 'react';
import { api } from '../lib/axios';

type THabitListProps = {
  date: Date;
  onCompletedChanged: (number: number) => void;
}

interface HabitListResponse {
  possibleHabits: {
    id: string;
    title: string;
    create_at: string;
  }[],
  completedHabits: string[];
}

const INITIAL_STATE_HABITS_INFO: HabitListResponse = {
  completedHabits: [],
  possibleHabits: [],
}

export function HabitList({ date, onCompletedChanged }: THabitListProps) {
  const [habitsInfo, setHabitsInfo] = useState(INITIAL_STATE_HABITS_INFO);

  useEffect(() => {
    api.get<HabitListResponse>('day', {
      params: {
        date: date.toISOString(),
      }
    }).then(({ data }) => {
      setHabitsInfo(data);
    });
  }, []);

  async function handleToggleHabit(habitId: string ) {
    await api.patch(`habits/${habitId}/toggle`);

    const isHabitAlreadyCompleted = habitsInfo.completedHabits.includes(habitId);

    let completedHabits: string[] = [];

    if (isHabitAlreadyCompleted) {
      completedHabits = habitsInfo.completedHabits.filter(id => id !== habitId);
    } else {
      completedHabits = [...habitsInfo.completedHabits, habitId];
    }

    setHabitsInfo(prevState => ({
      ...prevState,
      completedHabits,
    }));
    onCompletedChanged(completedHabits.length);
  }

  const isDateInPast = dayjs(date).endOf('day').isBefore(new Date());

  return (
    <div className='mt-6 flex flex-col gap-3'>
      {habitsInfo.possibleHabits.map(habit => (
        <Checkbox.Root
          key={habit.id}
          onCheckedChange={() => handleToggleHabit(habit.id)}
          className='flex items-center gap-3 group focus:outline-none disabled:cursor-not-allowed'
          disabled={isDateInPast}
          checked={habitsInfo.completedHabits.includes(habit.id)}
        >
          <div className='h-8 w-8 rounded-lg flex items-center justify-center bg-zinc-900 border-2 border-zinc-800 group-data-[state=checked]:bg-green-500 group-data-[state=checked]:border-green-500 transition-colors group-focus:ring-2 group-focus:ring-violet-600 group-focus:ring-offset-2 group-focus:ring-offset-background'>
            <Checkbox.Indicator>
              <Check size={20} className="text-white" />
            </Checkbox.Indicator>
          </div>

          <span className='font-semibold text-xl text-white leading-tight group-data-[state=checked]:line-through group-data-[state=checked]:text-zinc-400 transition-colors'>
            {habit.title}
          </span>
        </Checkbox.Root>
      ))}
      
    </div>
  );
}
