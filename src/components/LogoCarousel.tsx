import clientLogosDefault from "@/assets/client-logos.png";

interface LogoCarouselProps {
  imageUrl?: string;
}

const LogoCarousel = ({ imageUrl }: LogoCarouselProps) => {
  return (
    <section className="py-12 bg-secondary/30 border-y border-border/50">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm text-muted-foreground uppercase tracking-wider mb-8">
          Trusted by public organizations nationwide
        </p>
        
        <div className="flex justify-center">
          <img 
            src={imageUrl || clientLogosDefault} 
            alt="Trusted by HP, ExxonMobil, Pittsburgh Police, Cenovus, North Central Texas Council of Governments, Ntrepid Intelligence, Novartis, Alameda County, Optum, Pulse Electronics, Harris Utilities, L3 Wescam" 
            className="max-w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
};

export default LogoCarousel;
