import React from "react";
import { Image } from "react-native";
import Markdown, { type MarkdownProps } from "react-native-markdown-display";
import type { PropsWithChildren } from "react";

// react-native-markdown-display spreads a props object containing `key` into
// FitImage, which React 18 rejects. Override the image rule to pass key directly.
const imageRule: MarkdownProps["rules"] = {
  image: (node) => {
    const src = node.attributes?.src as string | undefined;
    const alt = node.attributes?.alt as string | undefined;
    return (
      <Image
        key={node.key}
        source={{ uri: src }}
        style={{ width: "100%", height: 200 }}
        resizeMode="contain"
        accessible={!!alt}
        accessibilityLabel={alt}
      />
    );
  },
};

export function WikiMarkdown({ rules, ...props }: PropsWithChildren<MarkdownProps>) {
  return <Markdown rules={{ ...imageRule, ...rules }} {...props} />;
}
