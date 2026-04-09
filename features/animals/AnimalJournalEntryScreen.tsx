import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, Subtitle } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import { locale } from "@/locales/i18n";
import Constants from "expo-constants";
import {
  Alert,
  Dimensions,
  Modal,
  PixelRatio,
  StatusBar,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "styled-components/native";
import {
  useAnimalJournalEntryQuery,
  useDeleteJournalEntryMutation,
} from "./animal-journal.hooks";
import { AnimalJournalEntryScreenProps } from "./navigation/animals-routes";
import { AnimalJournalImage } from "@/api/animal-journal.api";
import { IonIconButton } from "@/components/buttons/IconButton";
import { Ionicons } from "@expo/vector-icons";

function resolveLocalUrl(url: string): string {
  const lanIp = Constants.expoConfig?.hostUri?.split(":").shift();
  if (!lanIp) return url;
  return url.replace(/localhost|127\.0\.0\.1/g, lanIp);
}
import { Image } from "expo-image";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/features/user/users.hooks";

export function AnimalJournalEntryScreen({
  route,
  navigation,
}: AnimalJournalEntryScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { canWrite } = usePermissions();
  const { entryId, animalId } = route.params;
  const { entry } = useAnimalJournalEntryQuery(entryId);
  const deleteMutation = useDeleteJournalEntryMutation();
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  function handleDelete() {
    Alert.alert(t("animals.delete_journal_entry"), undefined, [
      { text: t("buttons.cancel"), style: "cancel" },
      {
        text: t("buttons.delete"),
        style: "destructive",
        onPress: async () => {
          await deleteMutation.mutateAsync({ entryId, animalId });
          navigation.goBack();
        },
      },
    ]);
  }
  const insets = useSafeAreaInsets();

  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  // Two columns with gap and horizontal padding
  const horizontalPadding = theme.spacing.m * 2;
  const gap = theme.spacing.s;
  const thumbSize = (screenWidth - horizontalPadding - gap) / 2;

  if (!entry) {
    return null;
  }

  return (
    <ContentView headerVisible>
      <ScrollView showHeaderOnScroll headerTitleOnScroll={entry.title}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <H2 style={{ flex: 1 }}>{entry.title}</H2>
          {canWrite("animals") && (
            <View style={{ flexDirection: "row", gap: theme.spacing.xs }}>
              <IonIconButton
                icon="trash-outline"
                type="accent"
                iconSize={22}
                color={theme.colors.danger}
                onPress={handleDelete}
                disabled={deleteMutation.isPending}
              />
              <IonIconButton
                icon="create-outline"
                type="accent"
                iconSize={22}
                color={theme.colors.primary}
                onPress={() =>
                  navigation.navigate("AnimalJournalEntryForm", {
                    animalId,
                    entryId,
                  })
                }
              />
            </View>
          )}
        </View>

        <View
          style={{
            alignSelf: "flex-start",
            marginTop: theme.spacing.s,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 20,
            backgroundColor: theme.colors.gray4,
          }}
        >
          <Subtitle style={{ color: theme.colors.gray1, fontSize: 13 }}>
            {formatLocalizedDate(new Date(entry.date), locale)}
          </Subtitle>
        </View>

        {entry.content ? (
          <View
            style={{
              marginTop: theme.spacing.m,
              backgroundColor: theme.colors.white,
              borderRadius: theme.radii.m,
              padding: theme.spacing.m,
              borderWidth: 1,
              borderColor: theme.colors.gray3,
            }}
          >
            <Subtitle style={{ color: theme.colors.gray1, lineHeight: 22 }}>
              {entry.content}
            </Subtitle>
          </View>
        ) : null}

        {entry.images.length > 0 && (
          <View
            style={{
              marginTop: theme.spacing.l,
              flexDirection: "row",
              flexWrap: "wrap",
              gap,
            }}
          >
            {entry.images.map((item: AnimalJournalImage) => {
              const resolvedUri = resolveLocalUrl(item.signedUrl);
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setFullscreenImage(resolvedUri)}
                  activeOpacity={0.85}
                >
                  <Image
                    source={{ uri: resolvedUri }}
                    style={{
                      width: thumbSize,
                      height: thumbSize,
                      borderRadius: theme.radii.m,
                    }}
                    contentFit="cover"
                    // Decode at physical pixel size for sharp rendering on high-DPI screens
                    contentPosition="center"
                    transition={150}
                    cachePolicy="memory-disk"
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Fullscreen image viewer */}
      <Modal
        visible={fullscreenImage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setFullscreenImage(null)}
        statusBarTranslucent
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.95)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => setFullscreenImage(null)}
            style={{
              position: "absolute",
              top:
                (StatusBar.currentHeight ?? 0) + insets.top + theme.spacing.s,
              right: theme.spacing.m,
              zIndex: 10,
              padding: theme.spacing.xs,
            }}
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>

          {fullscreenImage && (
            <Image
              source={{ uri: fullscreenImage }}
              style={{ width: screenWidth, height: screenHeight }}
              contentFit="contain"
            />
          )}
        </View>
      </Modal>
    </ContentView>
  );
}
