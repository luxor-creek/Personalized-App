interface FooterProps {
  logoUrl?: string | null;
}

const Footer = ({ logoUrl }: FooterProps) => {
  if (!logoUrl) return null;

  return (
    <footer className="py-8 bg-background border-t border-border">
      <div className="container mx-auto px-4 flex justify-center">
        <img src={logoUrl} alt="Logo" className="h-6 object-contain" />
      </div>
    </footer>
  );
};

export default Footer;
