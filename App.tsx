import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  ViewStyle,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

function CounterApp(): React.JSX.Element {
  // counter number
  const [count, setCount] = useState<number>(0);

  // increment counter
  const incrementCount = () => {
    setCount((prevCount) => prevCount + 1);
  };

  // change based on color scheme
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle: ViewStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <View>
        <Text style={[styles.counterText, {color: isDarkMode ? '#FFF' : '#333'}]}>
          Counter: {count}
        </Text>
        <TouchableOpacity style={styles.button} onPress={incrementCount}>
          <Text style={styles.buttonText}>Increment</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// styling
const styles = StyleSheet.create({
  counterText: {
    fontSize: 32,
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'red',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
  },
});

export default CounterApp;
