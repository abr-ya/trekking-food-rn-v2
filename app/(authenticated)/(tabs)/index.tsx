import { Image } from "expo-image";
import { Text, View } from "react-native";

// Local image is bundled and always works in release (no network needed)
const localImage = require("../../../assets/images/chip-and-dale-faces.png");

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Hello, Food!</Text>
      <Image
        source={localImage}
        style={{ width: 240, height: 240, marginTop: 16 }}
        contentFit="contain"
      />
    </View>
  );
}
