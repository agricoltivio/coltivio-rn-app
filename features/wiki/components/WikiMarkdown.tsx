import Constants from "expo-constants";
import React, { useEffect, useState } from "react";
import { Image, PixelRatio, useWindowDimensions } from "react-native";
import Markdown, { type MarkdownProps } from "react-native-markdown-display";
import type { PropsWithChildren } from "react";

// Replace localhost/127.0.0.1 with the LAN IP so images load on a physical device
function resolveLocalUrl(url: string): string {
  const lanIp = Constants.expoConfig?.hostUri?.split(":").shift();
  if (!lanIp) return url;
  return url.replace(/localhost|127\.0\.0\.1/g, lanIp);
}

function MarkdownImage({
  nodeKey,
  src,
  alt,
}: {
  nodeKey: string;
  src: string;
  alt?: string;
}) {
  const resolvedSrc = resolveLocalUrl(src);
  const { width: screenWidth } = useWindowDimensions();
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    Image.getSize(resolvedSrc, (w, h) => {
      if (w > 0 && h > 0) setNaturalSize({ width: w, height: h });
    });
  }, [resolvedSrc]);

  const pixelRatio = PixelRatio.get();
  const maxWidth = screenWidth - 32;

  // While getSize is pending, render a placeholder at full width with 16:9 ratio
  // so the layout doesn't jump when the real dimensions arrive.
  if (!naturalSize) {
    return (
      <Image
        key={nodeKey}
        source={{ uri: resolvedSrc }}
        style={{ width: maxWidth, height: maxWidth * (9 / 16), alignSelf: "flex-start" }}
        resizeMode="contain"
      />
    );
  }

  // Image.getSize returns physical pixels; convert to logical points for RN layout.
  const naturalWidthPt = naturalSize.width / pixelRatio;
  const naturalHeightPt = naturalSize.height / pixelRatio;
  const scale = Math.min(1, maxWidth / naturalWidthPt);
  const displayWidth = naturalWidthPt * scale;
  const displayHeight = naturalHeightPt * scale;

  return (
    <Image
      key={nodeKey}
      source={{ uri: resolvedSrc }}
      style={{ width: displayWidth, height: displayHeight, alignSelf: "flex-start" }}
      resizeMode="contain"
      accessible={!!alt}
      accessibilityLabel={alt}
    />
  );
}

// react-native-markdown-display spreads a props object containing `key` into
// FitImage, which React 18 rejects. Override the image rule to pass key directly.
const imageRule: MarkdownProps["rules"] = {
  image: (node) => {
    const src = node.attributes?.src as string | undefined;
    const alt = node.attributes?.alt as string | undefined;
    if (!src) return null;
    return (
      <MarkdownImage key={node.key} nodeKey={node.key} src={src} alt={alt} />
    );
  },
};

export function WikiMarkdown({
  rules,
  ...props
}: PropsWithChildren<MarkdownProps>) {
  return <Markdown rules={{ ...imageRule, ...rules }} {...props} />;
}
