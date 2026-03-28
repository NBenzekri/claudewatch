interface PlanViewerProps {
  content: string;
}

export default function PlanViewer({ content }: PlanViewerProps) {
  return (
    <div className="rounded-lg bg-card p-4">
      <pre className="whitespace-pre-wrap text-xs text-foreground/70 font-mono leading-relaxed max-h-[70vh] overflow-y-auto">
        {content}
      </pre>
    </div>
  );
}
