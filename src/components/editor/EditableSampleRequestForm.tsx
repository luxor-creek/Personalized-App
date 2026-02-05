import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from "./RichTextEditor";

interface EditableSampleRequestFormProps {
  formTitle: string;
  formSubtitle: string;
  onTitleChange: (value: string) => void;
  onSubtitleChange: (value: string) => void;
}

const EditableSampleRequestForm = ({
  formTitle,
  formSubtitle,
  onTitleChange,
  onSubtitleChange,
}: EditableSampleRequestFormProps) => {
  return (
    <section id="contact-form" className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left side - Info (Editable) */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-primary mb-4">
              GET STARTED
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              <RichTextEditor
                value={formTitle}
                onChange={onTitleChange}
                fieldName="Form Section Title"
                isHeadline
              />
            </h2>
            <div className="text-muted-foreground text-lg mb-10">
              <RichTextEditor
                value={formSubtitle}
                onChange={onSubtitleChange}
                fieldName="Form Section Subtitle"
              />
            </div>

            <div className="space-y-8">
              {[
                { 
                  number: 1, 
                  title: "Submit your request", 
                  description: "Tell us about your project and timeline." 
                },
                { 
                  number: 2, 
                  title: "We reach out", 
                  description: "Our team will contact you to discuss details." 
                },
                { 
                  number: 3, 
                  title: "Get your video", 
                  description: "Receive a professional video tailored to your needs." 
                },
              ].map((step) => (
                <div key={step.number} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center flex-shrink-0">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Form (Non-functional in editor) */}
          <div className="bg-white rounded-2xl p-8 border border-border shadow-sm">
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="First name"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Last Name</Label>
                  <Input
                    placeholder="Last name"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                    disabled
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="your@email.com"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">
                    Company <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="Company name"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">
                  Primary Goal <span className="text-destructive">*</span>
                </Label>
                <Input
                  value="Free Demo"
                  className="bg-background border-border text-foreground"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">
                  URL of product for the demo
                </Label>
                <Input
                  placeholder="https://example.com/product"
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  disabled
                />
              </div>

              <Button 
                type="button" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
                disabled
              >
                Send
              </Button>

              <p className="text-center text-muted-foreground text-sm">
                We'll get back to you in 30 mins or less.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditableSampleRequestForm;