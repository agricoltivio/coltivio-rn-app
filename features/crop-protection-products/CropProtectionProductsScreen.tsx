import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, Subtitle } from "@/theme/Typography";
import React from "react";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCropProtectionProductsQuery } from "./cropProtectionProduct.hooks";
import { CropProtectionProductsScreenProps } from "@/navigation/rootStackTypes";
import { useTranslation } from "react-i18next";

export function CropProtectionProductsScreen({
  route,
  navigation,
}: CropProtectionProductsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { cropProtectionProducts } = useCropProtectionProductsQuery();

  return (
    <>
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("crop_protection_applications.crop_protection")}
      >
        <ContentView headerVisible>
          <H2>{t("crop_protection_applications.crop_protection")}</H2>
          <View style={{ marginTop: theme.spacing.m }}>
            {cropProtectionProducts?.length === 0 && (
              <Subtitle>{t("common.no_entries")}</Subtitle>
            )}
            <View
              style={{
                borderRadius: 10,
                overflow: "hidden",
                backgroundColor: theme.colors.white,
              }}
            >
              {cropProtectionProducts?.map((cropProtectionProduct) => (
                <ListItem
                  key={cropProtectionProduct.id}
                  style={{ paddingVertical: 5 }}
                  onPress={() =>
                    navigation.navigate("EditCropProtectionProduct", {
                      cropProtectionProductId: cropProtectionProduct.id,
                    })
                  }
                >
                  <ListItem.Content>
                    <ListItem.Title>
                      {cropProtectionProduct.name}
                    </ListItem.Title>
                  </ListItem.Content>
                  <ListItem.Chevron />
                </ListItem>
              ))}
            </View>
          </View>
        </ContentView>
      </ScrollView>
      <FAB
        icon={{ name: "add", color: "white" }}
        onPress={() => navigation.navigate("CreateCropProtectionProduct")}
      />
    </>
  );
}
