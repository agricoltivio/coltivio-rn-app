import Constants from "expo-constants";
import React, { useEffect, useState } from "react";
import { Image } from "react-native";
import Markdown, { type MarkdownProps } from "react-native-markdown-display";
import type { PropsWithChildren } from "react";

// Replace localhost/127.0.0.1 with the LAN IP so images load on a physical device
function resolveLocalUrl(url: string): string {
  const lanIp = Constants.expoConfig?.hostUri?.split(":").shift();
  if (!lanIp) return url;
  return url.replace(/localhost|127\.0\.0\.1/g, lanIp);
}

function MarkdownImage({ nodeKey, src, alt }: { nodeKey: string; src: string; alt?: string }) {
  const resolvedSrc = resolveLocalUrl(src);
  const [aspectRatio, setAspectRatio] = useState<number>(16 / 9);

  useEffect(() => {
    Image.getSize(resolvedSrc, (w, h) => {
      if (h > 0) setAspectRatio(w / h);
    });
  }, [resolvedSrc]);

  return (
    <Image
      key={nodeKey}
      source={{ uri: resolvedSrc }}
      style={{ width: "100%", aspectRatio, maxHeight: 300 }}
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
    return <MarkdownImage key={node.key} nodeKey={node.key} src={src} alt={alt} />;
  },
};

export function WikiMarkdown({ rules, ...props }: PropsWithChildren<MarkdownProps>) {
  return <Markdown rules={{ ...imageRule, ...rules }} {...props} />;
}
