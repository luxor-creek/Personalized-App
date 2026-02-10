import { useTemplateContent } from "@/hooks/useTemplateContent";
import TemplateAccentProvider from "@/components/TemplateAccentProvider";
import WineVideoPage from "@/pages/wine/WineVideoPage";

const WineVideoTemplate = () => {
  const { template, loading } = useTemplateContent("wine-video");

  return (
    loading ? (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    ) : (
      <TemplateAccentProvider accentColor={template?.accent_color} className="min-h-screen">
        <WineVideoPage template={template} />
      </TemplateAccentProvider>
    )
  );
};

export default WineVideoTemplate;
