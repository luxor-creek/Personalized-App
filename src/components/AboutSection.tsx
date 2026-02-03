const AboutSection = () => {
  return (
    <section id="about" className="py-20 lg:py-32 bg-card relative">
      {/* Accent line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-primary rounded-full" />

      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Why Departments Choose
            <span className="text-gradient"> Kicker Video</span>
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              Most police recruitment videos aren't broken.
              <br />
              They're just outdated.
            </p>
            
            <p>
              They were made for a time when interest was high and competition was low. Today, recruits are more cautious, more informed, and quicker to walk away if something feels unrealistic or unclear.
            </p>
            
            <p>
              We see the same pattern again and again.
              <br />
              Departments invest in a video that looks professional, but doesn't answer the questions candidates are really asking. The result. Fewer qualified applicants and more drop-off later in the process.
            </p>
            
            <p className="text-foreground font-semibold">
              Kicker builds recruitment videos with one goal.
              <br />
              Help the right people self-select into the job.
            </p>
            
            <p>
              That means showing the work honestly. Letting officers speak in their own words. Being clear about expectations, career paths, and what the job actually demands.
            </p>
            
            <p>
              We recently wrapped a recruitment video for the Pittsburgh Police Department using this approach. The department saw stronger engagement and better-fit applicants because the video did its job early in the funnel.
            </p>
            
            <p className="text-foreground font-medium">
              If your current recruitment video is more than a few years old, it's worth asking a simple question.
              <br />
              <span className="text-primary">Is it helping your pipeline. Or quietly hurting it.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
