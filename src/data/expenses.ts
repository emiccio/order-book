import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExpenseCategory } from "@/domain/types";

export type ExpenseRow = {
  id: string;
  category: ExpenseCategory;
  description: string | null;
  amount: number;
  date: string;
};

/** `cycleId: null` trae los gastos de todos los ciclos. */
export async function listExpenses(
  supabase: SupabaseClient,
  cycleId: string | null,
): Promise<ExpenseRow[]> {
  let query = supabase
    .from("expenses")
    .select("id, category, description, amount, date")
    .order("date", { ascending: false });
  if (cycleId) query = query.eq("cycle_id", cycleId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as ExpenseRow[];
}

export type CreateExpenseResult = { error?: string };

export async function createExpense(
  supabase: SupabaseClient,
  userId: string,
  cycleId: string,
  input: { category: ExpenseCategory; amount: number; description: string | null; date: string },
): Promise<CreateExpenseResult> {
  const { error } = await supabase.from("expenses").insert({
    user_id: userId,
    cycle_id: cycleId,
    category: input.category,
    amount: input.amount,
    description: input.description,
    date: input.date,
  });
  if (error) {
    if (error.code === "P0001") return { error: "El ciclo está cerrado: no se pueden cargar gastos nuevos." };
    throw new Error(error.message);
  }
  return {};
}

export async function deleteExpense(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
