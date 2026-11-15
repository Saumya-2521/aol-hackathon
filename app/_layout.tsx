import '../global.css';
import { OpenSans_400Regular, OpenSans_500Medium, OpenSans_600SemiBold } from '@expo-google-fonts/open-sans';
import { Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Sheets } from '@/components/Sheets';
import { Toast } from '@/components/ui';
import { AppProvider } from '@/lib/app';
import { colors } from '@/theme';

export default function RootLayout() {
  const [loaded] = useFonts({ Poppins_600SemiBold, OpenSans_400Regular, OpenSans_500Medium, OpenSans_600SemiBold });
  if (!loaded) return null;
  return (
    <SafeAreaProvider>
      <AppProvider>
        {/* Mobile only: on the web the same phone layout sits in a centred column. */}
        <View className="flex-1 items-center bg-mist">
          <View className="w-full max-w-[480px] flex-1 bg-ground">
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ground } }} />
            <Toast />
            <Sheets />
          </View>
        </View>
        <StatusBar style="dark" />
      </AppProvider>
    </SafeAreaProvider>
  );
}
