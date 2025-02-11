import React from "react";
import { TaskContextProvider } from "@/context/taskContext";
import { Routes } from "@/routes";

import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from 'react-native-safe-area-context';


export default function App() {
  return (
    <TaskContextProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style="light" backgroundColor="#131016" translucent />
        <Routes />
      </SafeAreaView>
    </TaskContextProvider>
  );
}
