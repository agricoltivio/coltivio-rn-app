import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { ScrollView } from "@/components/views/ScrollView";
import { H2 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "styled-components/native";
import { useForm } from "react-hook-form";
import {
  useCreateJournalEntryMutation,
  useDeleteJournalEntryMutation,
  useUpdateJournalEntryMutation,
  useAnimalJournalEntryQuery,
} from "./animal-journal.hooks";
import { AnimalJournalEntryFormScreenProps } from "./navigation/animals-routes";
import { AnimalJournalImage } from "@/api/animal-journal.api";
import { useApi } from "@/api/api";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import Constants from "expo-constants";

// When running against local Supabase, the backend returns URLs with localhost
// which the device can't reach — replace with LAN IP from Expo Metro host.
function resolveLocalUrl(url: string): string {
  const lanIp = Constants.expoConfig?.hostUri?.split(":").shift();
  if (!lanIp) return url;
  return url.replace(/localhost|127\.0\.0\.1/g, lanIp);
}

type FormValues = {
  title: string;
  date: Date;
  content: string;
};

// Pending image for create mode (buffered until entry is created)
type PendingImage = {
  localUri: string;
  filename: string;
  blob: Blob;
};

export function AnimalJournalEntryFormScreen({
  route,
  navigation,
}: AnimalJournalEntryFormScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const api = useApi();
  const { animalId, entryId } = route.params;
  const isEditMode = entryId !== undefined;

  // In edit mode, load the existing entry for pre-filling and showing images
  const { entry } = useAnimalJournalEntryQuery(entryId ?? "");

  // Images shown in the form:
  // - Edit mode: starts from existing entry images, mutable via local state
  // - Create mode: empty until entry is created
  const [uploadedImages, setUploadedImages] = useState<AnimalJournalImage[]>([]);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill uploadedImages when entry loads in edit mode
  useEffect(() => {
    if (entry && isEditMode) {
      setUploadedImages(entry.images);
    }
  }, [entry, isEditMode]);

  const createMutation = useCreateJournalEntryMutation();
  const updateMutation = useUpdateJournalEntryMutation();
  const deleteMutation = useDeleteJournalEntryMutation();

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      title: "",
      date: new Date(),
      content: "",
    },
    values: entry
      ? {
          title: entry.title,
          date: new Date(entry.date),
          content: entry.content ?? "",
        }
      : undefined,
  });

  async function pickAndProcessImage(): Promise<PendingImage | null> {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });
    if (result.canceled || !result.assets[0]) return null;

    const asset = result.assets[0];
    const MAX_DIM = 1200;
    const { width, height } = asset;
    const resizeAction: ImageManipulator.Action | undefined =
      width > MAX_DIM || height > MAX_DIM
        ? width >= height
          ? { resize: { width: MAX_DIM } }
          : { resize: { height: MAX_DIM } }
        : undefined;

    const manipulated = await ImageManipulator.manipulateAsync(
      asset.uri,
      resizeAction ? [resizeAction] : [],
      { format: ImageManipulator.SaveFormat.JPEG, compress: 0.8 },
    );

    const fileResponse = await fetch(manipulated.uri);
    const blob = await fileResponse.blob();

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (blob.size > MAX_FILE_SIZE) {
      Alert.alert(t("common.error"), t("wiki.image_too_large"));
      return null;
    }

    const rawFilename = asset.fileName ?? `image_${Date.now()}`;
    const filename = rawFilename.replace(/\.[^.]+$/, ".jpg");

    return { localUri: manipulated.uri, filename, blob };
  }

  async function uploadImageForEntry(
    journalEntryId: string,
    pending: PendingImage,
  ): Promise<AnimalJournalImage> {
    const { signedUrl, path } = await api.animalJournal.getImageSignedUrl(
      journalEntryId,
      pending.filename,
    );
    await fetch(resolveLocalUrl(signedUrl), {
      method: "PUT",
      body: pending.blob,
    });
    return api.animalJournal.registerImage(journalEntryId, path);
  }

  async function handlePickImage() {
    const pending = await pickAndProcessImage();
    if (!pending) return;

    if (isEditMode && entryId) {
      // Upload immediately in edit mode
      setIsUploadingImage(true);
      try {
        const uploaded = await uploadImageForEntry(entryId, pending);
        setUploadedImages((prev) => [...prev, uploaded]);
      } catch {
        Alert.alert(t("common.error"), t("common.error"));
      } finally {
        setIsUploadingImage(false);
      }
    } else {
      // Buffer for create mode
      setPendingImages((prev) => [...prev, pending]);
    }
  }

  async function handleDeleteUploadedImage(imageId: string) {
    try {
      await api.animalJournal.deleteImage(imageId);
      setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch {
      Alert.alert(t("common.error"), t("common.error"));
    }
  }

  function handleDeletePendingImage(localUri: string) {
    setPendingImages((prev) => prev.filter((img) => img.localUri !== localUri));
  }

  async function onSubmit(values: FormValues) {
    const body = {
      title: values.title,
      date: values.date.toISOString(),
      content: values.content || undefined,
    };

    setIsSubmitting(true);
    try {
      if (isEditMode && entryId) {
        await updateMutation.mutateAsync({ entryId, animalId, body });
      } else {
        // Create entry first, then upload any pending images
        const created = await createMutation.mutateAsync({ animalId, body });
        for (const pending of pendingImages) {
          try {
            await uploadImageForEntry(created.id, pending);
          } catch {
            // Entry was created — image upload failure is non-fatal
          }
        }
      }
      navigation.goBack();
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDelete() {
    if (!entryId) return;
    Alert.alert(
      t("animals.delete_journal_entry"),
      undefined,
      [
        { text: t("buttons.cancel"), style: "cancel" },
        {
          text: t("buttons.delete"),
          style: "destructive",
          onPress: async () => {
            await deleteMutation.mutateAsync({ entryId, animalId });
            // Pop back to the journal list
            navigation.pop(2);
          },
        },
      ],
    );
  }

  const isBusy =
    isSubmitting ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  // All images shown in the form (uploaded for edit mode, pending local previews for create mode)
  const allImages: { id: string; uri: string; isPending: boolean }[] = [
    ...uploadedImages.map((img) => ({
      id: img.id,
      uri: resolveLocalUrl(img.signedUrl),
      isPending: false,
    })),
    ...pendingImages.map((img) => ({
      id: img.localUri,
      uri: img.localUri,
      isPending: true,
    })),
  ];

  const thumbSize = 80;

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.save")}
            onPress={handleSubmit(onSubmit)}
            disabled={isBusy}
            loading={isBusy}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView>
        <H2>
          {isEditMode
            ? t("animals.edit_journal_entry")
            : t("animals.add_journal_entry")}
        </H2>

        <View style={{ marginTop: theme.spacing.m, gap: theme.spacing.m }}>
          <RHTextInput
            control={control}
            name="title"
            label={t("forms.labels.name")}
            rules={{ required: true }}
            error={errors.title ? t("forms.validation.required") : undefined}
          />

          <RHDatePicker
            control={control}
            name="date"
            label={t("forms.labels.date")}
            rules={{ required: true }}
            mode="date"
          />

          <RHTextInput
            control={control}
            name="content"
            label={t("animals.journal_entry_content")}
            multiline
            numberOfLines={5}
            style={{ minHeight: 100, textAlignVertical: "top" }}
          />
        </View>

        {/* Image section */}
        <View style={{ marginTop: theme.spacing.l }}>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: theme.spacing.s,
              alignItems: "center",
            }}
          >
            {allImages.map((img) => (
              <View key={img.id} style={{ position: "relative" }}>
                <Image
                  source={{ uri: img.uri }}
                  style={{
                    width: thumbSize,
                    height: thumbSize,
                    borderRadius: theme.radii.s,
                  }}
                  contentFit="cover"
                />
                <TouchableOpacity
                  onPress={() =>
                    img.isPending
                      ? handleDeletePendingImage(img.id)
                      : handleDeleteUploadedImage(img.id)
                  }
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    backgroundColor: theme.colors.danger,
                    borderRadius: 10,
                    width: 20,
                    height: 20,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="close" size={12} color="white" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add image button */}
            <TouchableOpacity
              onPress={handlePickImage}
              disabled={isUploadingImage}
              style={{
                width: thumbSize,
                height: thumbSize,
                borderRadius: theme.radii.s,
                borderWidth: 1,
                borderColor: theme.colors.gray3,
                borderStyle: "dashed",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: theme.colors.background,
              }}
            >
              {isUploadingImage ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Ionicons name="camera-outline" size={24} color={theme.colors.gray1} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ContentView>
  );
}
