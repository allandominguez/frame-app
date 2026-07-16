import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { CalendarScreen } from '../features/calendar/components/CalendarScreen'
import { DayDetailScreen } from '../features/daydetail/components/DayDetailScreen'
import { RootStackParamList } from './types'

const Stack = createNativeStackNavigator<RootStackParamList>()

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Calendar" component={CalendarScreen} />
        <Stack.Screen name="DayDetail" component={DayDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
