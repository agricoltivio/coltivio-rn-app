import { ContentView } from "@/components/containers/ContentView";
import { Button } from "@/components/buttons/Button";
import { TextInput } from "@/components/inputs/TextInput";
import { H1, H3 } from "@/theme/Typography";
import { JoinFarmScreenProps } from "@/features/onboarding/navigation/onboarding-routes";
import { useAcceptInviteMutation } from "@/features/farms/farms.hooks";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { NavigationButton } from "./NavigationButton";
import styled from "styled-components/native";

export function JoinFarmScreen({ navigation }: JoinFarmScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const acceptInviteMutation = useAcceptInviteMutation(
    undefined,
    () => setErrorMessage(t("onboarding.join_farm.invalid_code")),
  );

  function onSubmit() {
    setErrorMessage(null);
    acceptInviteMutation.mutate(code.trim());
  }

  return (
    <ContentView headerVisible={false}>
      <View style={{ justifyContent: "center", flex: 1, padding: theme.spacing.m }}>
        <H1 style={{ color: theme.colors.primary }}>
          {t("onboarding.join_farm.heading")}
        </H1>
        <H3 style={{ color: theme.colors.primary, marginTop: theme.spacing.s }}>
          {t("onboarding.join_farm.subheading")}
        </H3>
        <InfoText style={{ marginTop: theme.spacing.m }}>
          {t("onboarding.join_farm.email_info")}
        </InfoText>
        <View style={{ marginTop: theme.spacing.xl }}>
          <TextInput
            label={t("onboarding.join_farm.code_label")}
            value={code}
            onChangeText={setCode}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        {errorMessage != null && (
          <ErrorText style={{ marginTop: theme.spacing.s }}>{errorMessage}</ErrorText>
        )}
        <View style={{ marginTop: theme.spacing.l }}>
          <Button
            type="primary"
            title={t("onboarding.join_farm.submit")}
            onPress={onSubmit}
            disabled={!code.trim() || acceptInviteMutation.isPending}
            loading={acceptInviteMutation.isPending}
          />
        </View>
      </View>
      <View
        style={{
          padding: theme.spacing.m,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <NavigationButton
          title={t("buttons.back")}
          icon="arrow-back-circle-outline"
          onPress={() => navigation.goBack()}
        />
      </View>
    </ContentView>
  );
}

const InfoText = styled.Text`
  color: ${({ theme }) => theme.colors.gray1};
  font-size: 14px;
  line-height: 20px;
`;

const ErrorText = styled.Text`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 14px;
`;
