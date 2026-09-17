import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
        sceneStyle: { backgroundColor: "#0f0f1a" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "الرئيسية" }} />
    </Tabs>
  );
}
