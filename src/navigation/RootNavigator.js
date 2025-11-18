// import React from "react";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import LoginScreen from "../screens/LoginScreen";
// import RegisterScreen from "../screens/RegisterScreen";
// import DashboardScreen from "../screens/DashboardScreen";
// import TransactionsScreen from "../screens/TransactionsScreen";
// import AddTransactionScreen from "../screens/AddTransactionScreen";
// import ChatbotScreen from "../screens/ChatbotScreen";

// const Stack = createNativeStackNavigator();

// export default function RootNavigator() {
//   return (
//     <Stack.Navigator initialRouteName="Login">
//       <Stack.Screen name="Login" component={LoginScreen} />
//       <Stack.Screen name="Register" component={RegisterScreen} />
//       <Stack.Screen name="Dashboard" component={DashboardScreen} />
//       <Stack.Screen name="Transactions" component={TransactionsScreen} />
//       <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
//       <Stack.Screen name="Chatbot" component={ChatbotScreen} />
//     </Stack.Navigator>
//   );
// }
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import ChatbotScreen from '../screens/ChatbotScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Transactions" component={TransactionsScreen} />
      <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
      <Stack.Screen name="Chatbot" component={ChatbotScreen} />
    </Stack.Navigator>
  );
}
