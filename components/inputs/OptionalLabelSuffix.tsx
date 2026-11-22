import { useTranslation } from "react-i18next";
import styled from "styled-components/native";

// Muted " (optional)" after a field label. Rendered inside the label's Text, so it
// wraps with it. A plain styled Text keeps the label's font; the app Text would switch
// to another font mid-line. Required fields get no marking.
export function OptionalLabelSuffix() {
  const { t } = useTranslation();
  return <SuffixText>{` (${t("forms.optional")})`}</SuffixText>;
}

const SuffixText = styled.Text`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.gray2};
`;
