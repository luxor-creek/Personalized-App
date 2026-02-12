import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CustomVariable {
  id: string;
  user_id: string;
  name: string;
  token: string;
  fallback_value: string;
  created_at: string;
  updated_at: string;
}

// Built-in system variables (always available)
export const SYSTEM_VARIABLES = [
  { token: "{{first_name}}", name: "First Name", type: "System" },
  { token: "{{last_name}}", name: "Last Name", type: "System" },
  { token: "{{company}}", name: "Company", type: "System" },
  { token: "{{full_name}}", name: "Full Name", type: "System" },
  { token: "{{landing_page}}", name: "Landing Page URL", type: "System" },
  { token: "{{custom_field}}", name: "Custom Field", type: "System" },
];

export function useCustomVariables() {
  const [variables, setVariables] = useState<CustomVariable[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVariables = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("custom_variables")
      .select("*")
      .order("name");
    if (!error && data) setVariables(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVariables();
  }, [fetchVariables]);

  const createVariable = async (name: string, token: string, fallbackValue = "") => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const cleanToken = token.startsWith("{{") ? token : `{{${token}}}`;
    const { data, error } = await (supabase as any)
      .from("custom_variables")
      .insert({ user_id: user.id, name, token: cleanToken, fallback_value: fallbackValue })
      .select()
      .single();
    if (error) throw error;
    setVariables((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    return data;
  };

  const updateVariable = async (id: string, updates: Partial<Pick<CustomVariable, "name" | "token" | "fallback_value">>) => {
    if (updates.token && !updates.token.startsWith("{{")) {
      updates.token = `{{${updates.token}}}`;
    }
    const { error } = await (supabase as any)
      .from("custom_variables")
      .update(updates)
      .eq("id", id);
    if (error) throw error;
    setVariables((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  };

  const deleteVariable = async (id: string) => {
    const { error } = await (supabase as any)
      .from("custom_variables")
      .delete()
      .eq("id", id);
    if (error) throw error;
    setVariables((prev) => prev.filter((v) => v.id !== id));
  };

  // Combined list: system + custom for dropdowns
  const allVariables = [
    ...SYSTEM_VARIABLES.map((v) => ({ ...v, isSystem: true as const, id: v.token })),
    ...variables.map((v) => ({ token: v.token, name: v.name, type: "Custom", isSystem: false as const, id: v.id, fallback_value: v.fallback_value })),
  ];

  return { variables, loading, allVariables, fetchVariables, createVariable, updateVariable, deleteVariable };
}
