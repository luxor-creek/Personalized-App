import { useTemplateContent } from "@/hooks/useTemplateContent";
import WineVideoPage from "@/pages/wine/WineVideoPage";

const WineVideoTemplate = () => {
  const { template, loading } = useTemplateContent("wine-video");

  return (
    loading ? (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    ) : (
      <WineVideoPage template={template} />
    )
  );
};

export default WineVideoTemplate;
