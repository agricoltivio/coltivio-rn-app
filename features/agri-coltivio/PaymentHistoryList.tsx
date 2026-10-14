import { ListItem, ListItemContent } from "@/components/list/ListItem";
import { H3 } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";

// Common shape of membership payments and donations: both are Stripe payment intents
// mirrored by the API, so one list renders either.
export type PaymentHistoryEntry = {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "refunded";
  cardBrand: string | null;
  cardLast4: string | null;
  paymentMethodType: string | null;
  createdAt: unknown;
};

type PaymentHistoryListProps = {
  title: string;
  payments: PaymentHistoryEntry[];
};

export function PaymentHistoryList({
  title,
  payments,
}: PaymentHistoryListProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();

  return (
    <>
      <H3 style={{ marginTop: theme.spacing.xl }}>{title}</H3>
      <View
        style={{
          marginTop: theme.spacing.m,
          borderRadius: theme.radii.l,
          overflow: "hidden",
          backgroundColor: theme.colors.white,
          marginHorizontal: theme.spacing.xs,
        }}
      >
        {payments.map((payment, index) => (
          <ListItem
            key={payment.id}
            hideBottomDivider={index === payments.length - 1}
          >
            <ListItemContent>
              <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
                {typeof payment.createdAt === "string" &&
                payment.createdAt.length > 0
                  ? formatLocalizedDate(
                      new Date(payment.createdAt),
                      i18n.language,
                    )
                  : "—"}
              </ListItem.Title>
              <ListItem.Body style={{ paddingLeft: theme.spacing.m }}>
                {payment.cardBrand && payment.cardLast4
                  ? `${payment.cardBrand.toUpperCase()} •••• ${payment.cardLast4}`
                  : payment.paymentMethodType === "twint"
                    ? t("membership.payment_method_twint")
                    : "—"}
              </ListItem.Body>
            </ListItemContent>
            <View
              style={{ alignItems: "flex-end", paddingRight: theme.spacing.m }}
            >
              <ListItem.Body>
                {`${payment.currency.toUpperCase()} ${(payment.amount / 100).toFixed(2)}`}
              </ListItem.Body>
              {payment.status === "refunded" && (
                <ListItem.Body style={{ fontSize: 13 }}>
                  {t("membership.payment_refunded")}
                </ListItem.Body>
              )}
            </View>
          </ListItem>
        ))}
      </View>
    </>
  );
}
