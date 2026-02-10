import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PLAN_LIMITS: Record<string, { max_pages: number; max_live_pages: number; max_campaigns: number }> = {
  trial: { max_pages: 3, max_live_pages: 1, max_campaigns: 1 },
  starter: { max_pages: 25, max_live_pages: 25, max_campaigns: 50 },
  pro: { max_pages: 999999, max_live_pages: 999999, max_campaigns: 999999 },
  enterprise: { max_pages: 999999, max_live_pages: 999999, max_campaigns: 999999 },
};

const PLAN_LABELS: Record<string, string> = {
  trial: "Free Trial (14 days)",
  starter: "Starter ($29/mo)",
  pro: "Pro ($59/mo)",
  enterprise: "Enterprise",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

    // Verify the caller is an admin using their JWT
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: callerUser }, error: authError } = await callerClient.auth.getUser();
    if (authError || !callerUser) throw new Error("Unauthorized");

    const { data: roleData } = await callerClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callerUser.id)
      .single();

    if (roleData?.role !== "admin") throw new Error("Admin access required");

    // Parse request
    const { email, full_name, plan } = await req.json();
    if (!email || !full_name || !plan) throw new Error("Missing required fields: email, full_name, plan");
    if (!PLAN_LIMITS[plan]) throw new Error("Invalid plan");

    // Create user with admin API (service role)
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Create user — email_confirm: true so they don't need to verify
    const { data: newUserData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (createError) throw new Error(`Failed to create user: ${createError.message}`);
    const newUser = newUserData.user;

    // Update the auto-created profile with the correct plan & limits
    const limits = PLAN_LIMITS[plan];
    const profileUpdate: Record<string, unknown> = {
      plan,
      full_name,
      max_pages: limits.max_pages,
      max_live_pages: limits.max_live_pages,
      max_campaigns: limits.max_campaigns,
    };

    if (plan === "trial") {
      profileUpdate.trial_ends_at = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    } else {
      profileUpdate.trial_ends_at = null;
    }

    await adminClient
      .from("profiles")
      .update(profileUpdate)
      .eq("user_id", newUser.id);

    // Generate password reset link so the user can set their password
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: `${req.headers.get("origin") || "https://recruitmentvideoproduction.lovable.app"}/auth`,
      },
    });

    // Send welcome email with password setup link via Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    console.log("[create-user] RESEND_API_KEY present:", !!resendKey);
    if (resendKey) {
      const resend = new Resend(resendKey);
      const firstName = full_name.split(" ")[0];
      const planLabel = PLAN_LABELS[plan] || plan;

      // Use the hashed_token from the generated link to build the confirmation URL
      const tokenHash = linkData?.properties?.hashed_token;
      const setupUrl = tokenHash
        ? `${supabaseUrl}/auth/v1/verify?token=${tokenHash}&type=magiclink&redirect_to=${encodeURIComponent(req.headers.get("origin") || "https://recruitmentvideoproduction.lovable.app")}`
        : `${req.headers.get("origin") || "https://recruitmentvideoproduction.lovable.app"}/auth`;

      const isPaid = plan !== "trial";

      const emailHtml = isPaid
        ? `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1a1a1a;">Welcome to Personalized Pages! 🎉</h1>
            <p>Hi ${firstName},</p>
            <p>Your <strong>${planLabel}</strong> account has been created and is ready to go.</p>
            <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0; font-weight: 600;">Your Plan: ${planLabel}</p>
              <p style="margin: 8px 0 0; color: #666;">You have full access to all features included in your plan.</p>
            </div>
            <p>To get started, click the button below to set up your password and log in:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${setupUrl}" style="background: #2563eb; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 600;">Set Up Your Password</a>
            </p>
            <p style="color: #888; font-size: 13px;">If the button doesn't work, copy and paste this link: ${setupUrl}</p>
            <p>Welcome aboard!<br/>The Personalized Pages Team</p>
          </div>
        `
        : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1a1a1a;">Welcome to Personalized Pages!</h1>
            <p>Hi ${firstName},</p>
            <p>Your free trial account has been created. You have <strong>14 days</strong> to explore the platform.</p>
            <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0; font-weight: 600;">Free Trial — 14 Days</p>
              <p style="margin: 8px 0 0; color: #666;">Includes 1 campaign, up to 3 personalized pages.</p>
            </div>
            <p>Click below to set up your password and start creating:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${setupUrl}" style="background: #2563eb; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 600;">Set Up Your Password</a>
            </p>
            <p style="color: #888; font-size: 13px;">If the button doesn't work, copy and paste this link: ${setupUrl}</p>
            <p>Welcome aboard!<br/>The Personalized Pages Team</p>
          </div>
        `;

      console.log("[create-user] Sending invite email to:", email, "from: Personalized Pages <noreply@personalizedpages.io>");
      const emailResult = await resend.emails.send({
        from: "Personalized Pages <noreply@personalizedpages.io>",
        to: [email],
        subject: isPaid
          ? `Welcome to Personalized Pages — Your ${planLabel} account is ready`
          : "Welcome to Personalized Pages — Your free trial starts now",
        html: emailHtml,
      });
      console.log("[create-user] Resend response:", JSON.stringify(emailResult));

      if (emailResult.error) {
        console.error("[create-user] Resend rejected email:", JSON.stringify(emailResult.error));
        return new Response(
          JSON.stringify({ success: true, user_id: newUser.id, email_error: emailResult.error.message }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      console.log("[create-user] Email sent successfully, id:", emailResult.data?.id);
    } else {
      console.warn("[create-user] RESEND_API_KEY not found — skipping invite email");
      return new Response(
        JSON.stringify({ success: true, user_id: newUser.id, email_error: "Email service not configured" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, user_id: newUser.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("create-user error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
