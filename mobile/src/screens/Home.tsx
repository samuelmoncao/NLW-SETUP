import { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';

import dayjs from 'dayjs';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { DAY_SIZE, HabitDay } from '../components/HabitDay';
import { HabitHeader } from '../components/HabitHeader';
import { Header } from '../components/Header';
import { Loading } from '../components/Loading';
import { api } from '../lib/axios';
import { generateRangeDatesFromYearStart } from '../utils/generate-range-between-dates';

const datesFromYearStart = generateRangeDatesFromYearStart();
const minimumSummaryDateSizes = 14 * 7;
const amountOfDaysToFill = minimumSummaryDateSizes - datesFromYearStart.length;

type TSummary = {
  id: string;
  date: string;
  amount: number;
  completed: number;
}

export function Home() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<TSummary[]>([]);

  const { navigate } = useNavigation();

  const fetchData = useCallback(() => {
    setLoading(true);
    api.get<TSummary[]>('/summary')
      .then(({data}) => {
        setSummary(data);
      })
      .catch(error => {
        console.log(error);
        Alert.alert('Ops', 'Não foi possível carregar o sumário de hábitos');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useFocusEffect(useCallback(() => {
    fetchData();
  }, []));

  if(loading) return <Loading />

  return (
    <View className='flex-1 bg-background px-8 pt-16'>
      <Header />

      <HabitHeader />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 64,
        }}
      >
        <View className='flex-row flex-wrap'>
          {
            datesFromYearStart.map(date => {
              const dayInSummary = summary.find(dateSummary => {
                return dayjs(date).isSame(dateSummary.date, 'day');
              });

              return (
                <HabitDay
                  key={date.toISOString()}
                  date={date}
                  amount={dayInSummary?.amount}
                  completed={dayInSummary?.completed}
                  onPress={() => navigate('habit', { date: date.toISOString() })}
                />
              );
            })
          }

          {
            amountOfDaysToFill > 0 && Array
              .from({ length: amountOfDaysToFill })
              .map((_, i) => (
                <View
                  key={`${i}`}
                  className='bg-zinc-900 rounded-lg border-2 m-1 border-zinc-800 opacity-40'
                  style={{ width: DAY_SIZE, height: DAY_SIZE }}
                />
              ))
          }
        </View>
      </ScrollView>
    </View>
  )
}