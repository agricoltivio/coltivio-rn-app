import { WikiMarkdown } from "@/features/wiki/components/WikiMarkdown";
import { useTheme } from "styled-components/native";

export function ReleaseNotesMarkdown({ children }: { children: string }) {
  const theme = useTheme();
  return (
    <WikiMarkdown
      style={{
        body: { color: theme.colors.primary, fontSize: 16, lineHeight: 24 },
        heading1: { color: theme.colors.primary, lineHeight: 40 },
        heading2: { color: theme.colors.primary, lineHeight: 32 },
        heading3: { color: theme.colors.primary, lineHeight: 28 },
        link: { color: theme.colors.amber },
      }}
    >
      {children}
    </WikiMarkdown>
  );
}
