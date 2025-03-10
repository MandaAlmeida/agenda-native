import { theme } from "@/styles/theme";
import { ActivityIndicator, View } from "react-native";

export function Loading() {
    return (
        <View style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.lightGray
        }}>
            <ActivityIndicator size="large" color={theme.blue1} />
        </View>
    );
}