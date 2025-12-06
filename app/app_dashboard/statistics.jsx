import { StyleSheet } from 'react-native'

import Spacer from "../../components/spacer"
import ThemedText from "../../components/ThemedText"
import ThemedView from "../../components/ThemedView"

const Statistics = () => {
  return (
    <ThemedView style={styles.container}>

      <Spacer />
      <ThemedText title={true} style={styles.heading}>
        This feature is coming soon!
      </ThemedText>

    </ThemedView>
  )
}

export default Statistics

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "stretch",
  },
  heading: {
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
})