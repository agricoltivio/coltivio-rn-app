import { BottomDrawerModal } from "@/components/bottom-drawer/BottomDrawerModal";
import { ListItem } from "@/components/list/ListItem";
import { Chip } from "@/components/chips/Chip";
import { H2, Body } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { FarmScreenProps } from "./navigation/farm-routes";
import { useActiveFarm } from "./ActiveFarmContext";
import { useFarmRoleUi } from "./farm-role-ui";
import { useFarmsQuery } from "./farms.hooks";

type FarmSwitcherSheetProps = {
  visible: boolean;
  onClose: () => void;
  navigation: FarmScreenProps["navigation"];
};

export function FarmSwitcherSheet({
  visible,
  onClose,
  navigation,
}: FarmSwitcherSheetProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { farms } = useFarmsQuery();
  const { activeFarmId, setActiveFarmId } = useActiveFarm();
  const { roleColors, roleLabels } = useFarmRoleUi();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (visible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible]);

  function handleSelectFarm(farmId: string) {
    bottomSheetModalRef.current?.dismiss();
    if (farmId === activeFarmId) {
      return;
    }
    // setActiveFarmId also discards the whole query cache (query keys aren't farm-scoped),
    // so screens don't keep showing the previous farm's data.
    setActiveFarmId(farmId);
    // Land on Home rather than staying on My Farm, which would otherwise show a stale/
    // refetching view of the new farm.
    navigation.popTo("Home");
  }

  function handleCreateAnotherFarm() {
    bottomSheetModalRef.current?.dismiss();
    navigation.navigate("SelectFarmName");
  }

  function handleJoinWithCode() {
    bottomSheetModalRef.current?.dismiss();
    navigation.navigate("JoinFarm");
  }

  return (
    <BottomSheetModalProvider>
      <BottomDrawerModal
        ref={bottomSheetModalRef}
        onClose={onClose}
        snapPoints={["60%"]}
      >
        <H2>{t("farm.switcher.title")}</H2>
        <View style={{ marginTop: theme.spacing.m }}>
          {farms?.result.map((farm) => (
            <ListItem key={farm.id} onPress={() => handleSelectFarm(farm.id)}>
              <ListItem.Content>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: theme.spacing.s,
                  }}
                >
                  <ListItem.Title>{farm.name}</ListItem.Title>
                  <Chip
                    label={roleLabels[farm.role]}
                    bgColor={roleColors[farm.role].bg}
                    textColor={roleColors[farm.role].text}
                    small
                  />
                </View>
                {farm.address ? (
                  <ListItem.Body>{farm.address}</ListItem.Body>
                ) : null}
              </ListItem.Content>
              {farm.id === activeFarmId ? (
                <ListItem.RightIcon>
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={theme.colors.primary}
                  />
                </ListItem.RightIcon>
              ) : null}
            </ListItem>
          ))}

          <ListItem onPress={handleCreateAnotherFarm}>
            <ListItem.Content>
              <Body style={{ color: theme.colors.primary }}>
                {t("farm.switcher.create_another")}
              </Body>
            </ListItem.Content>
          </ListItem>
          <ListItem hideBottomDivider onPress={handleJoinWithCode}>
            <ListItem.Content>
              <Body style={{ color: theme.colors.primary }}>
                {t("farm.switcher.join_with_code")}
              </Body>
            </ListItem.Content>
          </ListItem>
        </View>
      </BottomDrawerModal>
    </BottomSheetModalProvider>
  );
}
