interface FooterProps {
  logoUrl?: string | null;
}

const Footer = ({ logoUrl }: FooterProps) => {
  return (
    <footer className="py-8 bg-background border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-6 object-contain" />
          ) : (
            <div />
          )}

          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Professional video production.
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              We collect anonymous analytics to improve our service.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
