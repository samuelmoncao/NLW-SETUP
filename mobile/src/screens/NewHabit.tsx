import { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Feather } from '@expo/vector-icons';
import { BackButton } from "../components/BackButton";
import { Checkbox } from "../components/Checkbox";
import colors from "tailwindcss/colors";
import { api } from "../lib/axios";

const availableWeekDay = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
]

export function NewHabit() {
  const [title, setTitle] = useState('');
  const [weekDays, setWeekDays] = useState<number[]>([]);

  async function handleSubmitCreateHabit() {
    try {
      if(!title.trim() || !weekDays.length) {
        return Alert.alert('Novo Hábito', 'Informe o nome e pelo menos 1 dia da semana');
      }

      await api.post('habits', {
        title,
        weekDays,
      });
      Alert.alert('Hábito adicionado');
      setTitle('');
      setWeekDays([]);
    } catch (error) {
      console.log(error);
      Alert.alert('Error ao salvar', 'Não foi possível salvar o novo hábito');
    }
  }

  function handleToggleWeekDay(weekDay: number) {
    if(weekDays.includes(weekDay)) {
      setWeekDays(prevState => prevState.filter(day => (day !== weekDay)));
    } else {
      setWeekDays(prevState => [...prevState, weekDay]);
    }
  }

  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 64 }}
      >
        <BackButton />

        <Text className="mt-6 text-white font-extrabold text-3xl">
          Criar hábito
        </Text>

        <Text className="mt-6 text-white font-semibold text-base">
          Qual seu comprometimento?
        </Text>

        <TextInput
          className="h-12 pl-4 rounded-lg mt-3 bg-zinc-900 text-white border-2 border-zinc-800 focus:border-green-600"
          placeholder="Exercícios, dormir bem, etc..."
          placeholderTextColor={colors.zinc[400]}
          onChangeText={setTitle}
          value={title}
        />

        <Text className="font-semibold mt-4 mb-3 text-white text-base">
          Qual a recorrência?
        </Text>
        {
          availableWeekDay.map((weekDay, index) => (
            <Checkbox
              key={weekDay}
              title={weekDay}
              checked={weekDays.includes(index)}
              onPress={() => handleToggleWeekDay(index)}
            />
          ))
        }

        <TouchableOpacity
          activeOpacity={0.7}
          className="w-full h-14 flex-row items-center justify-center bg-green-600 rounded-lg mt-6"
          onPress={handleSubmitCreateHabit}
        >
          <Feather
            name="check"
            size={20}
            color={colors.white}
          />
          <Text
            className="font-semibold text-base text-white ml-2"
          >
            Confirmar
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}