import LayoutShell from "@/components/LayoutShell.tsx";
import TemplateGallery from "./_components/TemplateGallery.tsx";

export default function Templates() {
  return (
    <LayoutShell>
      <div className="px-5 py-5">
        <h1 className="text-lg font-bold mb-1">Ready-Made Templates</h1>
        <p className="text-xs text-muted-foreground mb-5">Pick a template and follow the step-by-step wizard</p>
        <TemplateGallery />
      </div>
    </LayoutShell>
  );
}
