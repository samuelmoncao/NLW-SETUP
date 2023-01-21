import { useEffect, useState } from "react";
import { useRoute } from "@react-navigation/native";
import { Alert, ScrollView, Text, View } from "react-native";

import dayjs from "dayjs";

import { BackButton } from "../components/BackButton";
import { ProgressBar } from "../components/ProgressBar";
import { Checkbox } from "../components/Checkbox";
import { Loading } from "../components/Loading";
import { api } from "../lib/axios";
import { generateProgressPercentage } from "../utils/generate-progress-percentage";
import { HabitsEmpty } from "../components/HabitsEmpty";
import clsx from "clsx";

interface Params {
  date: string;
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


export function Habit() {
  const route = useRoute();
  const { date } = route.params as Params;
  const [loading, setLoading] = useState(false);
  const [habits, setHabits] = useState(INITIAL_STATE_HABITS_INFO);

  const parsedDate = dayjs(date);
  const dayOfWeek = parsedDate.format('dddd');
  const dayAndMonth = parsedDate.format('DD/MM');

  async function fetchHabits() {
    try {
      setLoading(true);
      const { data } = await api.get<HabitListResponse>('/day', {
        params: { date },
      });

      setHabits(data);
    } catch (error) {
      console.log(error);
      Alert.alert('Ops!', 'Não foi possível carregar os hábitos do dia');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleHabit(habitId: string ) {
    try {
      await api.patch(`habits/${habitId}/toggle`);

      const isHabitAlreadyCompleted = habits.completedHabits.includes(habitId);

      let completedHabits: string[] = [];

      if (isHabitAlreadyCompleted) {
        completedHabits = habits.completedHabits.filter(id => id !== habitId);
      } else {
        completedHabits = [...habits.completedHabits, habitId];
      }

      setHabits(prevState => ({
        ...prevState,
        completedHabits,
      }));
    } catch (error) {
      console.log(error);
      Alert.alert('Ops!', 'Não foi possível alterar o status do hábito');
    }
    
  }

  useEffect(() => {
    fetchHabits();
  }, []);

  if (loading) {
    return <Loading />;
  }
  
  const isDateInPast = parsedDate.endOf('day').isBefore(new Date());
  const habitsProgress = generateProgressPercentage(habits.possibleHabits.length, habits.completedHabits.length);

  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 64,
        }}
      >
        <BackButton />

        <Text className="mt-6 text-zinc-400 font-semibold text-base lowercase">
          {dayOfWeek}
        </Text>

        <Text className="text-white font-extrabold text-3xl">
          {dayAndMonth}
        </Text>

        <ProgressBar progress={habitsProgress} />

        <View className={clsx("mt-6", {
          ["opacity-50"]: isDateInPast
        })}>
          {habits.possibleHabits.length === 0 && <HabitsEmpty />}
          {habits.possibleHabits.map(habit => (
            <Checkbox
              key={habit.id}
              title={habit.title}
              disabled={isDateInPast}
              checked={habits.completedHabits.includes(habit.id)}
              onPress={() => handleToggleHabit(habit.id)}
            />
          ))}
        </View>

        {
          isDateInPast && (
            <Text className="text-white mt-10 text-center">
              Você não pode atualizar um hábito no passado
            </Text>
          )
        }
      </ScrollView>
    </View>
  );
}