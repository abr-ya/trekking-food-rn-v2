import { Image } from "expo-image";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Hello, World!</Text>
      <Image
        source={{ uri: "https://www.disneyclips.com/images3/images/chip-and-dale-faces.png" }}
        style={{ width: 240, height: 240, marginTop: 16 }}
        contentFit="contain"
      />
    </View>
  );
}
