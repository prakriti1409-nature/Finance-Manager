import 'react-native-reanimated';
import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigator";
import { Provider } from "react-redux";
import store from "./src/store/store";

export default function App() {
  return (
    <Provider store={store}>
      <PaperProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </PaperProvider>
    </Provider>
  );
}
