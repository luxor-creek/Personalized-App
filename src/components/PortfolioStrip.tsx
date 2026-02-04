import portfolioStripDefault from "@/assets/portfolio-strip.png";

interface PortfolioStripProps {
  imageUrl?: string;
}

const PortfolioStrip = ({ imageUrl }: PortfolioStripProps) => {
  return (
    <section className="bg-background">
      <div className="w-full">
        <img 
          src={imageUrl || portfolioStripDefault} 
          alt="Portfolio examples: Alameda County Waste Management Authority, Active Shooter Awareness training video, Police community engagement" 
          className="w-full h-auto"
        />
      </div>
    </section>
  );
};

export default PortfolioStrip;
