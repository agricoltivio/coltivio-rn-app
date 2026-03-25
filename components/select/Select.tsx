import { IonIconButton } from "@/components/buttons/IconButton";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { H2 } from "@/theme/Typography";
import Fuse from "fuse.js";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Modal, Pressable, View } from "react-native";
import { Dropdown as RnDropdown } from "react-native-element-dropdown";
import { DropdownProps } from "react-native-element-dropdown/lib/typescript/components/Dropdown/model";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled, { useTheme } from "styled-components/native";

export type SelectProps = {
  label?: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  data: { label: string; value: string }[];
  style?: any;
  error?: string;
  enableSearch?: boolean;
};
export function Select({
  label,
  value,
  data,
  onChange,
  onBlur,
  onFocus,
  disabled,
  enableSearch,
  placeholder,
  style,
  error,
}: SelectProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [focus, setFocus] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  const selectedLabel = data.find((item) => item.value === value)?.label;

  const fuse = useMemo(
    () => new Fuse(data, { minMatchCharLength: 1, keys: ["label"] }),
    [data],
  );

  const filteredData = useMemo(() => {
    if (searchText.length === 0) return data;
    return fuse.search(searchText).map((result) => result.item);
  }, [searchText, fuse, data]);

  const handleItemSelect = useCallback(
    (itemValue: string) => {
      onChange?.(itemValue);
      setModalVisible(false);
      setSearchText("");
    },
    [onChange],
  );

  const renderItem = useCallback(
    ({ item }: { item: { label: string; value: string } }) => (
      <ListItem onPress={() => handleItemSelect(item.value)}>
        <ListItem.Content>
          <ListItem.Title
            style={{
              flex: 1,
              fontWeight: item.value === value ? "600" : "400",
            }}
          >
            {item.label}
          </ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
    ),
    [handleItemSelect, value],
  );

  // When enableSearch is true, render a pressable trigger + modal instead of the dropdown
  if (enableSearch) {
    return (
      <View>
        <Label>{label}</Label>
        <SearchTrigger
          style={style}
          onPress={() => {
            if (!disabled) setModalVisible(true);
          }}
          error={!!error}
        >
          <TriggerText
            style={{
              color: selectedLabel
                ? disabled
                  ? theme.colors.gray2
                  : theme.colors.gray0
                : theme.colors.gray1,
              paddingTop: 32,
            }}
          >
            {selectedLabel || placeholder || t("forms.labels.please_select")}
          </TriggerText>
        </SearchTrigger>

        {error && (
          <View style={{ marginTop: 3, paddingHorizontal: 5 }}>
            <ErrorText>{error}</ErrorText>
          </View>
        )}

        <Modal
          visible={modalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => {
            setModalVisible(false);
            setSearchText("");
          }}
        >
          <View
            style={{
              flex: 1,
              paddingTop: insets.top + theme.spacing.m,
              paddingHorizontal: theme.spacing.m,
              backgroundColor: theme.colors.background,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <H2
                style={{ flex: 1, marginRight: theme.spacing.s }}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {label || t("forms.labels.please_select")}
              </H2>
              <IonIconButton
                icon="close"
                color="black"
                type="accent"
                iconSize={24}
                onPress={() => {
                  setModalVisible(false);
                  setSearchText("");
                }}
              />
            </View>
            <View style={{ marginVertical: theme.spacing.m }}>
              <TextInput
                hideLabel
                placeholder={t("forms.placeholders.search")}
                onChangeText={setSearchText}
                value={searchText}
              />
            </View>
            <FlatList
              contentContainerStyle={{
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,
                overflow: "hidden",
                backgroundColor: theme.colors.white,
              }}
              data={filteredData}
              keyExtractor={(item) => item.value}
              renderItem={renderItem}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View>
      <Label>{label}</Label>
      <Dropdown
        style={{
          ...style,
        }}
        itemContainerStyle={{
          backgroundColor: theme.colors.white,
        }}
        containerStyle={{
          backgroundColor: theme.colors.white,
        }}
        itemTextStyle={{ color: theme.colors.gray0, fontSize: 17 }}
        placeholderStyle={{
          color: theme.colors.gray1,
          fontSize: 17,
          paddingTop: 32,
        }}
        selectedTextStyle={{
          fontSize: 17,
          color: disabled ? theme.colors.gray2 : theme.colors.gray0,
          paddingTop: 32,
        }}
        data={data}
        labelField="label"
        valueField="value"
        disable={disabled}
        placeholder={placeholder || t("forms.labels.please_select")}
        value={value}
        error={!!error}
        focus={focus}
        onFocus={() => {
          setFocus(true);
          onFocus?.();
        }}
        onBlur={() => {
          setFocus(false);
          onBlur?.();
        }}
        onChange={(item) => {
          onChange?.(item.value);
        }}
      />
      {error && (
        <View style={{ marginTop: 3, paddingHorizontal: 5 }}>
          <ErrorText>{error}</ErrorText>
        </View>
      )}
    </View>
  );
}
type CustomDropdownProps = DropdownProps<any> & {
  focus: boolean;
  error?: boolean;
};

const Dropdown = styled(RnDropdown)<CustomDropdownProps>`
  width: 100%;
  padding: 0px 10px 10px 10px;
  font-size: 17px;
  font-weight: 400;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.colors.white};
  border-width: 1px;
  border-color: ${({ theme, focus, error }) =>
    error
      ? theme.colors.danger
      : focus
        ? theme.colors.primary
        : theme.colors.gray2};
`;

const SearchTrigger = styled(Pressable)<{ error?: boolean }>`
  width: 100%;
  padding: 0px 10px 10px 10px;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.colors.white};
  border-width: 1px;
  border-color: ${({ theme, error }) =>
    error ? theme.colors.danger : theme.colors.gray2};
`;

const TriggerText = styled.Text`
  font-size: 17px;
  font-weight: 400;
`;

const ErrorText = styled.Text`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 14px;
  font-weight: 400;
`;

const Label = styled.Text`
  z-index: 1;
  font-size: 16px;
  position: absolute;
  top: 10px;
  left: 10px;

  /* margin-bottom: 5px; */
  color: ${({ theme }) => theme.colors.gray2};
`;
