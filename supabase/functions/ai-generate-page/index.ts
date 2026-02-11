import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a landing page architect. Given a business description, generate a JSON array of page sections for a drag-and-drop page builder.

Available section types and their content fields:
- "hero": text (headline), heroSubheadline, buttonText, buttonLink, secondaryButtonText, heroBadge
- "headline": text
- "body": text
- "features": featureItems (array of {icon: emoji, title, description})
- "benefits": benefitsTitle, benefitsSubtitle, benefitItems (array of strings)
- "steps": stepsTitle, stepsSubtitle, stepItems (array of {title, description})
- "testimonials": testimonialItems (array of {quote, author, role})
- "stats": statItems (array of {value, label})
- "cta": text, buttonText, buttonLink
- "faq": faqItems (array of {question, answer})
- "footer": footerColumns (array of {title, links: [{label, url}]}), footerCopyright

Each section has:
- id: random 8-char string
- type: one of the types above
- content: object with the fields above
- style: object with backgroundColor (hex), textColor (hex), paddingY (e.g. "64px"), fontSize, fontWeight, textAlign, buttonColor, buttonTextColor, maxWidth, accentColor

Generate 5-8 sections that create a compelling landing page. Use colors that fit the brand/industry. Make copy specific to the business described, not generic. Use personalization tokens like {{first_name}} and {{company}} in the headline and subheadline where it makes sense for outreach.

Return ONLY a valid JSON array, no markdown, no explanation.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";

    // Extract JSON from response (strip markdown fences if present)
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("Could not parse AI response:", raw);
      throw new Error("AI did not return valid JSON");
    }

    const sections = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({ sections }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-generate-page error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
