import { ReactNode, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
} from "react-native";
import { useTheme } from "styled-components/native";
import { IonIconButton } from "../buttons/IconButton";

// Length of ScrollView's animated scrollTo, after which a loop copy is swapped for the real card
const SCROLL_ANIMATION_MS = 350;

// Horizontally swipeable chart cards with dots below showing the current card, and
// previous/next buttons next to the dots for people who don't think of swiping.
// All cards get the height of the tallest one. With more than one card it loops:
// a copy of the last card sits before the first and a copy of the first after
// the last; landing on a copy jumps (unanimated) to the real card.
export function ChartPager({
  pages,
}: {
  pages: { key: string; content: ReactNode }[];
}) {
  const theme = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const loops = pages.length > 1;
  // Pages can shrink when data reloads
  const currentPageIndex = Math.min(activePageIndex, pages.length - 1);

  const renderedPages = loops
    ? [
        { ...pages[pages.length - 1], key: "loop-start" },
        ...pages,
        { ...pages[0], key: "loop-end" },
      ]
    : pages;

  function onLayout(event: LayoutChangeEvent) {
    setPageWidth(event.nativeEvent.layout.width);
  }

  // Start on the first real card (behind the leading copy)
  function onContentSizeChange() {
    if (!loops || pageWidth === 0) return;
    scrollViewRef.current?.scrollTo({
      x: (currentPageIndex + 1) * pageWidth,
      animated: false,
    });
  }

  function onScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    if (pageWidth === 0) return;
    const renderedIndex = Math.round(
      event.nativeEvent.contentOffset.x / pageWidth,
    );
    if (!loops) {
      setActivePageIndex(renderedIndex);
      return;
    }
    // Copies at both ends map to the real card on the other end
    let pageIndex = renderedIndex - 1;
    if (renderedIndex === 0) pageIndex = pages.length - 1;
    if (renderedIndex === pages.length + 1) pageIndex = 0;
    if (pageIndex !== renderedIndex - 1) {
      scrollViewRef.current?.scrollTo({
        x: (pageIndex + 1) * pageWidth,
        animated: false,
      });
    }
    setActivePageIndex(pageIndex);
  }

  // Pending swap from a loop copy to the real card after a button press
  const pendingCopySwapRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function cancelPendingCopySwap() {
    if (pendingCopySwapRef.current === null) return false;
    clearTimeout(pendingCopySwapRef.current);
    pendingCopySwapRef.current = null;
    return true;
  }

  // Previous/next button. Past either end it animates onto the loop copy (so it
  // looks like a normal step) and then swaps to the real card without animation.
  function goToPage(step: -1 | 1) {
    if (!loops || pageWidth === 0) return;
    // Pressed again while still on a copy: move to the real card first, otherwise
    // the next step would start from the copy and the old swap would land elsewhere
    if (cancelPendingCopySwap()) {
      scrollViewRef.current?.scrollTo({
        x: (currentPageIndex + 1) * pageWidth,
        animated: false,
      });
    }
    const targetRenderedIndex = currentPageIndex + 1 + step;
    scrollViewRef.current?.scrollTo({
      x: targetRenderedIndex * pageWidth,
      animated: true,
    });
    const targetPageIndex =
      (currentPageIndex + step + pages.length) % pages.length;
    setActivePageIndex(targetPageIndex);
    const landsOnCopy =
      targetRenderedIndex === 0 || targetRenderedIndex === pages.length + 1;
    if (landsOnCopy) {
      pendingCopySwapRef.current = setTimeout(() => {
        pendingCopySwapRef.current = null;
        scrollViewRef.current?.scrollTo({
          x: (targetPageIndex + 1) * pageWidth,
          animated: false,
        });
      }, SCROLL_ANIMATION_MS);
    }
  }

  return (
    <View onLayout={onLayout} style={{ marginTop: theme.spacing.m }}>
      {pageWidth > 0 && (
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          // A swipe takes over from a button press, the swipe's own scroll end handles copies
          onScrollBeginDrag={() => cancelPendingCopySwap()}
          onContentSizeChange={onContentSizeChange}
          // Pages stretch to the tallest one
          contentContainerStyle={{ alignItems: "stretch" }}
        >
          {renderedPages.map((page) => (
            <View
              key={page.key}
              style={{
                width: pageWidth,
                backgroundColor: theme.colors.white,
                borderRadius: 10,
                padding: theme.spacing.m,
              }}
            >
              {page.content}
            </View>
          ))}
        </ScrollView>
      )}
      {loops && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: theme.spacing.s,
            marginTop: theme.spacing.s,
          }}
        >
          <IonIconButton
            icon="chevron-back"
            type="ghost"
            iconSize={22}
            color={theme.colors.primary}
            onPress={() => goToPage(-1)}
          />
          <View style={{ flexDirection: "row", gap: 6 }}>
            {pages.map((page, index) => (
              <View
                key={page.key}
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 3.5,
                  backgroundColor:
                    index === currentPageIndex
                      ? theme.colors.primary
                      : theme.colors.gray3,
                }}
              />
            ))}
          </View>
          <IonIconButton
            icon="chevron-forward"
            type="ghost"
            iconSize={22}
            color={theme.colors.primary}
            onPress={() => goToPage(1)}
          />
        </View>
      )}
    </View>
  );
}
