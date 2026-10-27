import { ReactNode, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
} from "react-native";
import { useTheme } from "styled-components/native";

// Horizontally swipeable chart cards with dots below showing the current card.
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

  return (
    <View onLayout={onLayout} style={{ marginTop: theme.spacing.m }}>
      {pageWidth > 0 && (
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
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
            gap: 6,
            marginTop: theme.spacing.s,
          }}
        >
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
      )}
    </View>
  );
}
