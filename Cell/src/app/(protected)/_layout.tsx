import { Redirect, Stack } from "expo-router";
import { AuthContext } from "../utils/AuthContext";
import { useContext } from "react";

export default function ProtectedLayout() {
    
    const authState = useContext(AuthContext);
    
    if (!authState.isReady) {
        return null;    
    }
    
    if (!authState.isLoggedIn) {
        return <Redirect href="/login" />;    
    }
    
  return(
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
              headerShown: false,
          }}
        />
          <Stack.Screen name="+not-found" options={{}}/>
          <Stack.Screen name="edit-user" options={{
              headerShown: false,
          }}/>
          <Stack.Screen name="edit-medical" options={{
              headerShown: false,
          }}/>
      </Stack>
  );
}
