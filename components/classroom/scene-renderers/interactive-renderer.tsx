"use client";

interface InteractiveRendererProps {
  content: string;
}

export function InteractiveRenderer({ content }: InteractiveRendererProps) {
  return (
    <iframe
      srcDoc={content}
      sandbox="allow-scripts"
      style={{
        width: "100%",
        minHeight: "400px",
        borderRadius: "8px",
        border: "none",
        display: "block",
      }}
      title="Interactive simulation"
    />
  );
}
