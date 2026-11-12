import { BreedingCalendarEntry } from "@/api/breeding.api";
import { FAB } from "@/components/buttons/FAB";
import { IonIconButton } from "@/components/buttons/IconButton";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { hexToRgba } from "@/theme/theme";
import { Body, H2, H3, Subtitle } from "@/theme/Typography";
import {
  formatLocalizedDate,
  parseDateOnly,
  toLocalDateString,
} from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import {
  addMonths,
  differenceInCalendarMonths,
  endOfMonth,
  getDay,
  getDaysInMonth,
  isSameDay,
  startOfMonth,
} from "date-fns";
import { type ReactNode, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useTheme } from "styled-components/native";
import { usePermissions } from "@/features/user/users.hooks";
import { useBreedingCalendarQuery } from "./breeding.hooks";
import { BreedingCalendarScreenProps } from "./navigation/animals-routes";

type CalendarEvent = {
  key: string;
  kind: "birth" | "heat";
  date: Date;
  entry: BreedingCalendarEntry;
};

const WEEKDAY_COUNT = 7;

// Day circle in the month grid and the width of each event color ring around the number
const DAY_CIRCLE_SIZE = 36;
const RING_WIDTH = 2;
// Height of a week row in the month grid
const DAY_CELL_HEIGHT = 44;
// Opacity of the primary color filling a selected day
const SELECTED_TINT_ALPHA = 0.2;
// Horizontal movement before the month swipe takes over, and the distance that changes the month
const MONTH_SWIPE_ACTIVATION = 20;
const MONTH_SWIPE_DISTANCE = 50;
// Duration of the slide out of the old month and of the slide in of the new one
const MONTH_SLIDE_DURATION_MS = 180;

export function BreedingCalendarScreen({
  navigation,
}: BreedingCalendarScreenProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const theme = useTheme();
  const { canWrite } = usePermissions();
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(new Date()),
  );
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // The neighbouring months too, they are visible while swiping
  const { entries } = useBreedingCalendarQuery(
    toLocalDateString(addMonths(visibleMonth, -1)),
    toLocalDateString(endOfMonth(addMonths(visibleMonth, 1))),
  );

  // Every entry can produce a heat event and (when mated) a birth event, keep those in the given month
  function eventsInMonth(month: Date) {
    const events: CalendarEvent[] = [];
    const monthEnd = endOfMonth(month);
    const isInMonth = (date: Date) => date >= month && date <= monthEnd;
    for (const entry of entries ?? []) {
      const heatDate = parseDateOnly(entry.date);
      if (isInMonth(heatDate)) {
        events.push({
          key: `${entry.id}-heat`,
          kind: "heat",
          date: heatDate,
          entry,
        });
      }
      if (entry.expectedBirthDate) {
        const birthDate = parseDateOnly(entry.expectedBirthDate);
        if (isInMonth(birthDate)) {
          events.push({
            key: `${entry.id}-birth`,
            kind: "birth",
            date: birthDate,
            entry,
          });
        }
      }
    }
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }
  const monthEvents = eventsInMonth(visibleMonth);

  // Distinct colors: heat orange, mated heat teal, expected birth green
  function eventColor(event: CalendarEvent) {
    if (event.kind === "birth") return theme.colors.success;
    return event.entry.mated ? theme.colors.primary : theme.colors.amber;
  }

  // Legend only lists what this month contains; heats use the species words ("Bockig / Stierig")
  const heatLegendLabel = [
    ...new Set(
      monthEvents
        .filter((event) => event.kind === "heat" && !event.entry.mated)
        .map((event) => t(`breeding.heat_by_type.${event.entry.animal.type}`)),
    ),
  ].join(" / ");
  const legendItems = [
    ...(heatLegendLabel
      ? [{ color: theme.colors.amber, label: heatLegendLabel }]
      : []),
    ...(monthEvents.some((event) => event.kind === "heat" && event.entry.mated)
      ? [{ color: theme.colors.primary, label: t("breeding.mated") }]
      : []),
    { color: theme.colors.success, label: t("breeding.expected_birth") },
  ];

  const shownEvents = selectedDay
    ? monthEvents.filter((event) => isSameDay(event.date, selectedDay))
    : monthEvents;

  // Monday-first grid: leading blanks before the 1st, then the days of the month
  function monthDayCells(month: Date): (Date | null)[] {
    const leadingBlankDays = (getDay(month) + 6) % WEEKDAY_COUNT;
    return [
      ...Array.from({ length: leadingBlankDays }, () => null),
      ...Array.from(
        { length: getDaysInMonth(month) },
        (_, dayIndex) =>
          new Date(month.getFullYear(), month.getMonth(), dayIndex + 1),
      ),
    ];
  }
  const weekdayLabels = Array.from({ length: WEEKDAY_COUNT }, (_, dayIndex) =>
    new Intl.DateTimeFormat(locale, { weekday: "narrow" }).format(
      // 2024-01-01 was a Monday
      new Date(2024, 0, 1 + dayIndex),
    ),
  );
  const today = new Date();

  // Carousel of the previous, visible and next month. Every month has a fixed place in the row, counted from
  // the month the screen opened with, and the row slides to the visible month's place. After a change the
  // rendered months keep their places (keyed by month), only the new neighbour is added and the far one
  // removed, so nothing has to jump back and nothing flickers.
  const anchorMonth = useRef(visibleMonth).current;
  const monthPlace = (month: Date) =>
    differenceInCalendarMonths(month, anchorMonth);
  const [pageWidth, setPageWidth] = useState(0);
  const pageWidthValue = useSharedValue(0);
  // Horizontal position of the row: -place × width of the visible month, plus the finger while swiping
  const rowOffset = useSharedValue(0);
  const swipeStartOffset = useSharedValue(0);
  const rowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: rowOffset.value }],
  }));

  function commitMonthChange(monthDelta: number) {
    setVisibleMonth((month) => addMonths(month, monthDelta));
    setSelectedDay(null);
  }

  function changeMonth(monthDelta: number) {
    const targetPlace = monthPlace(visibleMonth) + monthDelta;
    rowOffset.value = withTiming(
      -targetPlace * pageWidthValue.value,
      { duration: MONTH_SLIDE_DURATION_MS },
      (finished) => {
        if (finished) scheduleOnRN(commitMonthChange, monthDelta);
      },
    );
  }

  // Swipe left for the next month, right for the previous one; the row follows the finger. Only clearly
  // horizontal movements activate it, so taps on days and the vertical scrolling of the screen keep working.
  const monthSwipeGesture = Gesture.Pan()
    .activeOffsetX([-MONTH_SWIPE_ACTIVATION, MONTH_SWIPE_ACTIVATION])
    .failOffsetY([-MONTH_SWIPE_ACTIVATION, MONTH_SWIPE_ACTIVATION])
    .onStart(() => {
      swipeStartOffset.value = rowOffset.value;
    })
    .onUpdate((event) => {
      rowOffset.value = swipeStartOffset.value + event.translationX;
    })
    .onEnd((event) => {
      const monthDelta =
        event.translationX <= -MONTH_SWIPE_DISTANCE
          ? 1
          : event.translationX >= MONTH_SWIPE_DISTANCE
            ? -1
            : 0;
      const startPlace =
        pageWidthValue.value > 0
          ? Math.round(-swipeStartOffset.value / pageWidthValue.value)
          : 0;
      rowOffset.value = withTiming(
        -(startPlace + monthDelta) * pageWidthValue.value,
        { duration: MONTH_SLIDE_DURATION_MS },
        (finished) => {
          if (finished && monthDelta !== 0) {
            scheduleOnRN(commitMonthChange, monthDelta);
          }
        },
      );
    });

  // The months are positioned absolutely, so the row gets the height of the tallest of the three
  const carouselMonths = [-1, 0, 1].map((monthDelta) =>
    addMonths(visibleMonth, monthDelta),
  );
  const carouselHeight =
    Math.max(
      ...carouselMonths.map((month) =>
        Math.ceil(monthDayCells(month).length / WEEKDAY_COUNT),
      ),
    ) * DAY_CELL_HEIGHT;

  // Day grid of one month; only the visible month shows the selection
  function renderMonthGrid(month: Date, isVisibleMonth: boolean) {
    const gridEvents = eventsInMonth(month);
    return (
      <View
        key={toLocalDateString(month)}
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          width: pageWidth > 0 ? pageWidth : "100%",
          ...(pageWidth > 0
            ? {
                position: "absolute",
                top: 0,
                left: monthPlace(month) * pageWidth,
              }
            : {}),
        }}
      >
        {monthDayCells(month).map((day, cellIndex) => {
          if (!day) {
            return (
              <View
                key={`blank-${cellIndex}`}
                style={{ width: "14.2857%", height: DAY_CELL_HEIGHT }}
              />
            );
          }
          const dayEvents = gridEvents.filter((event) =>
            isSameDay(event.date, day),
          );
          const dayColors = [...new Set(dayEvents.map(eventColor))];
          const isSelected =
            isVisibleMonth &&
            selectedDay != null &&
            isSameDay(day, selectedDay);
          const isToday = isSameDay(day, today);
          return (
            <TouchableOpacity
              key={day.toISOString()}
              style={{
                width: "14.2857%",
                height: DAY_CELL_HEIGHT,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => setSelectedDay(isSelected ? null : day)}
            >
              {/* One ring per event color around the day number, the first color outermost. Selected days
                      get a light primary tint inside the rings. Today gets a thin primary ring
                      without events, otherwise a bold primary number. */}
              {dayColors.reduceRight<ReactNode>(
                (inner, ringColor, ringIndex) => (
                  <View
                    key={ringColor}
                    style={{
                      width: DAY_CIRCLE_SIZE - 2 * RING_WIDTH * ringIndex,
                      height: DAY_CIRCLE_SIZE - 2 * RING_WIDTH * ringIndex,
                      borderRadius: DAY_CIRCLE_SIZE / 2,
                      borderWidth: RING_WIDTH,
                      borderColor: ringColor,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {inner}
                  </View>
                ),
                <View
                  style={{
                    width: DAY_CIRCLE_SIZE - 2 * RING_WIDTH * dayColors.length,
                    height: DAY_CIRCLE_SIZE - 2 * RING_WIDTH * dayColors.length,
                    borderRadius: DAY_CIRCLE_SIZE / 2,
                    alignItems: "center",
                    justifyContent: "center",
                    // Light tint, so the colored rings stay readable around it
                    backgroundColor: isSelected
                      ? hexToRgba(theme.colors.primary, SELECTED_TINT_ALPHA)
                      : "transparent",
                    borderWidth:
                      isToday && !isSelected && dayColors.length === 0 ? 1 : 0,
                    borderColor: theme.colors.primary,
                  }}
                >
                  <Body
                    style={{
                      // Selected: dark and bold on the tint. Today with events: bold primary, the rings
                      // take the place of today's ring.
                      color:
                        isToday && dayColors.length > 0 && !isSelected
                          ? theme.colors.primary
                          : theme.colors.black,
                      fontWeight:
                        isSelected || (isToday && dayColors.length > 0)
                          ? "700"
                          : undefined,
                    }}
                  >
                    {day.getDate()}
                  </Body>
                </View>,
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <ContentView headerVisible>
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("breeding.calendar_title")}
      >
        <H2>{t("breeding.calendar_title")}</H2>

        <View
          style={{
            marginTop: theme.spacing.m,
            padding: theme.spacing.m,
            borderRadius: 10,
            backgroundColor: theme.colors.white,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <IonIconButton
              icon="chevron-back"
              type="ghost"
              iconSize={22}
              color={theme.colors.primary}
              onPress={() => changeMonth(-1)}
            />
            <H3>
              {new Intl.DateTimeFormat(locale, {
                month: "long",
                year: "numeric",
              }).format(visibleMonth)}
            </H3>
            <IonIconButton
              icon="chevron-forward"
              type="ghost"
              iconSize={22}
              color={theme.colors.primary}
              onPress={() => changeMonth(1)}
            />
          </View>

          <View style={{ flexDirection: "row", marginTop: theme.spacing.s }}>
            {weekdayLabels.map((label, labelIndex) => (
              <View key={labelIndex} style={{ flex: 1, alignItems: "center" }}>
                <Body style={{ color: theme.colors.gray2, fontSize: 12 }}>
                  {label}
                </Body>
              </View>
            ))}
          </View>
          <GestureDetector gesture={monthSwipeGesture}>
            <View
              style={{ overflow: "hidden" }}
              onLayout={(event) => {
                const width = event.nativeEvent.layout.width;
                setPageWidth(width);
                pageWidthValue.value = width;
                rowOffset.value = -monthPlace(visibleMonth) * width;
              }}
            >
              {pageWidth > 0 ? (
                <Animated.View
                  style={[{ height: carouselHeight }, rowAnimatedStyle]}
                >
                  {carouselMonths.map((month) =>
                    renderMonthGrid(month, isSameDay(month, visibleMonth)),
                  )}
                </Animated.View>
              ) : (
                renderMonthGrid(visibleMonth, true)
              )}
            </View>
          </GestureDetector>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              columnGap: theme.spacing.m,
              rowGap: theme.spacing.xxs,
              marginTop: theme.spacing.s,
            }}
          >
            {legendItems.map((legendItem) => (
              <View
                key={legendItem.label}
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: legendItem.color,
                  }}
                />
                <Body style={{ fontSize: 12 }}>{legendItem.label}</Body>
              </View>
            ))}
          </View>
        </View>

        <View style={{ marginTop: theme.spacing.l }}>
          {shownEvents.length === 0 ? (
            <Subtitle>{t("breeding.no_entries_month")}</Subtitle>
          ) : (
            <View
              style={{
                borderRadius: 10,
                overflow: "hidden",
                backgroundColor: theme.colors.white,
              }}
            >
              {shownEvents.map((event) => {
                const animalLabel = event.entry.animal.earTagNumber
                  ? `${event.entry.animal.earTagNumber} - ${event.entry.animal.name}`
                  : event.entry.animal.name;
                const sireLabel =
                  event.entry.sire?.name ?? event.entry.sireName;
                return (
                  <ListItem
                    key={event.key}
                    style={{ paddingVertical: 5 }}
                    // Births and heats both belong to the heat entry, open it to edit (else the animal)
                    onPress={() =>
                      canWrite("animals")
                        ? navigation.navigate("AnimalHeatForm", {
                            animalId: event.entry.animal.id,
                            heatId: event.entry.id,
                          })
                        : navigation.navigate("AnimalDetails", {
                            animalId: event.entry.animal.id,
                          })
                    }
                  >
                    {/* ListItem stretches its children to the row height, center the icon in its own box */}
                    <View
                      style={{
                        justifyContent: "center",
                        paddingLeft: theme.spacing.m,
                      }}
                    >
                      <Ionicons
                        name={
                          event.kind === "birth" ? "heart" : "calendar-outline"
                        }
                        size={20}
                        color={eventColor(event)}
                      />
                    </View>
                    <ListItem.Content>
                      <ListItem.Title>{animalLabel}</ListItem.Title>
                      <ListItem.Body>
                        {formatLocalizedDate(event.date, locale)} ·{" "}
                        {event.kind === "birth"
                          ? t("breeding.expected_birth")
                          : [
                              t(
                                `breeding.heat_by_type.${event.entry.animal.type}`,
                              ),
                              ...(event.entry.mated
                                ? [t("breeding.mated")]
                                : []),
                              ...(event.entry.conceptionFailed
                                ? [t("breeding.conception_failed")]
                                : []),
                            ].join(" · ")}
                        {sireLabel ? ` · ${sireLabel}` : ""}
                      </ListItem.Body>
                    </ListItem.Content>
                    <ListItem.Chevron />
                  </ListItem>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
      {/* New heat for one or several animals, picked in the form, on the selected day if there is one */}
      {canWrite("animals") && (
        <FAB
          icon={{ name: "add", color: "white" }}
          onPress={() =>
            navigation.navigate(
              "AnimalHeatForm",
              selectedDay ? { date: toLocalDateString(selectedDay) } : {},
            )
          }
        />
      )}
    </ContentView>
  );
}
