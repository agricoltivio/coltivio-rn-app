import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  ScrollView,
  View,
} from "react-native";
import { TextInput } from "./TextInput";
import { ListItem } from "../list/ListItem";
import { useTheme } from "styled-components/native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaFrame } from "react-native-safe-area-context";

export type AutocompleteInputProps<T> = {
  label?: string;
  isLoading?: boolean;
  placeholder?: string;
  query: string;
  results: T[];
  setQuery: (text: string) => void;
  onResultSelect: (item: T) => void;
  getListItemTitel: (item: T) => string;
  moveTopOnFocus?: boolean;
};

// const AnimatedInput = Animated.createAnimatedComponent(TextInput);

export function AutocompleteInput<T>({
  label,
  placeholder,
  isLoading,
  query,
  setQuery,
  results,
  onResultSelect,
  getListItemTitel,
  moveTopOnFocus = true,
}: AutocompleteInputProps<T>) {
  const [showResults, setShowResults] = useState(false);
  const theme = useTheme();

  const translateY = useSharedValue(0); // Initial position

  const handleFocus = () => {
    translateY.value = withTiming(-350, { duration: 400 }); // Moves up when focused
  };

  const handleBlur = () => {
    if (showResults) return;
    translateY.value = withTiming(0, { duration: 400 }); // Moves back down
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleResultSelect = (item: T) => {
    setShowResults(false); // Hide results
    onResultSelect(item); // Set the selected item in the input
    Keyboard.dismiss();
    translateY.value = withTiming(0, { duration: 400 }); // Moves back down
  };

  const handleInputChange = (text: string) => {
    setQuery(text);
    if (text) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  return (
    <Animated.View style={[moveTopOnFocus && animatedStyle, { zIndex: 1000 }]}>
      <TextInput
        style={[
          showResults && results.length > 0
            ? {
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              }
            : undefined,
        ]}
        label={label}
        hideLabel={!label}
        value={query}
        placeholder={placeholder}
        onChangeText={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {isLoading && (
        <ActivityIndicator
          size={"small"}
          style={{ position: "absolute", right: 10, top: 20 }}
        />
      )}
      {showResults && results.length > 0 && (
        <View
          style={{
            position: "absolute",
            top: 58, // Adjust based on input height
            left: 0,
            right: 0,
            backgroundColor: theme.colors.white,
            // borderRadius: 4,
            borderWidth: 1,
            // borderTopWidth: 0,
            borderColor: theme.colors.gray2,
            maxHeight: 300, // Set max height for scrolling
            zIndex: 1000, // Ensure it's above other elements
          }}
        >
          <ScrollView nestedScrollEnabled keyboardShouldPersistTaps={"handled"}>
            {results.map((item, index) => (
              <ListItem
                key={index}
                onPress={() => handleResultSelect(item)}
                style={{
                  backgroundColor: theme.colors.white,
                  zIndex: 1000,
                }}
              >
                <ListItem.Content
                  style={{
                    paddingHorizontal: theme.spacing.s,
                  }}
                >
                  <ListItem.Title>{getListItemTitel(item)}</ListItem.Title>
                </ListItem.Content>
              </ListItem>
            ))}
          </ScrollView>
          {/* <FlatList
            data={results}
            keyboardShouldPersistTaps={"handled"}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item }) => (
              <ListItem
                onPress={() => handleResultSelect(item)}
                style={{
                  backgroundColor: theme.colors.white,
                  zIndex: 1000,
                }}
              >
                <ListItem.Content
                  style={{
                    paddingHorizontal: theme.spacing.s,
                  }}
                >
                  <ListItem.Title>{getListItemTitel(item)}</ListItem.Title>
                </ListItem.Content>
              </ListItem>
            )}
          /> */}
        </View>
      )}
    </Animated.View>
  );
}
