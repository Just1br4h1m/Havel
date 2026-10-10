import { View, StyleSheet } from "react-native";
import { Link, Stack } from "expo-router";

export default function NotFoundScreen()
{
    return(
        <>
            <Stack.Screen options={{ title: "Opps! Not Found" }}/>
            <View style={styles.container}>
                <Link href="/" style={styles.button}>
                    Go back to home
                </Link>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    button: {
        fontSize: 20,
        textDecorationLine: "underline",
        color: "blue",
    }
})