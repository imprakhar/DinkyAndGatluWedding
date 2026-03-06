"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";

import { BudgetBarChart } from "@/components/charts/budget-bar-chart";
import { SectionHeader } from "@/components/layout/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/ui/loading";
import { api } from "@/lib/api";
import { currency } from "@/lib/utils";
import type { BudgetItem } from "@/types";

const budgetSchema = z.object({
  category: z.string().min(1, "Category is required"),
  estimated_cost: z.coerce.number().min(0),
  actual_cost: z.coerce.number().min(0),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

const defaults: BudgetFormValues = {
  category: "",
  estimated_cost: 0,
  actual_cost: 0,
};

export default function BudgetPage() {
  const [loading, setLoading] = useState(true);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [drafts, setDrafts] = useState<Record<number, Omit<BudgetItem, "id">>>({});

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: defaults,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await api.getBudget();
      setBudgetItems(data);
      setDrafts(
        Object.fromEntries(
          data.map((item) => [
            item.id,
            {
              category: item.category,
              estimated_cost: item.estimated_cost,
              actual_cost: item.actual_cost,
            },
          ]),
        ),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load budget");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totals = useMemo(() => {
    const estimated = budgetItems.reduce((sum, item) => sum + item.estimated_cost, 0);
    const spent = budgetItems.reduce((sum, item) => sum + item.actual_cost, 0);
    const remaining = estimated - spent;
    return { estimated, spent, remaining };
  }, [budgetItems]);

  const addCategory = form.handleSubmit(async (values) => {
    try {
      await api.createBudgetItem(values);
      toast.success("Budget category added");
      form.reset(defaults);
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add category");
    }
  });

  const updateItem = async (itemId: number) => {
    try {
      const draft = drafts[itemId];
      if (!draft) return;
      await api.updateBudgetItem(itemId, draft);
      toast.success("Budget item updated");
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update item");
    }
  };

  const deleteItem = async (itemId: number) => {
    try {
      await api.deleteBudgetItem(itemId);
      toast.success("Budget item deleted");
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete item");
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Wedding Budget Calculator"
        description="Track estimated and actual spend for every wedding category."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Estimated Budget</p>
            <p className="text-2xl font-semibold">{currency(totals.estimated)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Spent</p>
            <p className="text-2xl font-semibold">{currency(totals.spent)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              {totals.remaining >= 0 ? "Remaining Budget" : "Overspend"}
            </p>
            <p className="text-2xl font-semibold">
              {currency(Math.abs(totals.remaining))}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-[var(--font-display)] text-2xl">Add Budget Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addCategory} className="grid gap-3 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" placeholder="e.g. Mehendi" {...form.register("category")} />
              <p className="text-xs text-red-600">{form.formState.errors.category?.message}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated_cost">Estimated Cost</Label>
              <Input
                id="estimated_cost"
                type="number"
                min={0}
                step={1}
                {...form.register("estimated_cost")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actual_cost">Actual Cost</Label>
              <Input
                id="actual_cost"
                type="number"
                min={0}
                step={1}
                {...form.register("actual_cost")}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-[var(--font-display)] text-2xl">Budget Graph</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <LoadingState label="Loading chart..." /> : <BudgetBarChart data={budgetItems} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-[var(--font-display)] text-2xl">Budget Items</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <LoadingState label="Loading budget items..." /> : null}

          {!loading ? (
            <div className="space-y-3">
              {budgetItems.map((item) => {
                const draft = drafts[item.id] ?? {
                  category: item.category,
                  estimated_cost: item.estimated_cost,
                  actual_cost: item.actual_cost,
                };

                return (
                  <div
                    key={item.id}
                    className="grid gap-2 rounded-lg border border-border/70 bg-background/70 p-3 md:grid-cols-[1.6fr_1fr_1fr_auto_auto]"
                  >
                    <Input
                      value={draft.category}
                      onChange={(event) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [item.id]: { ...draft, category: event.target.value },
                        }))
                      }
                    />
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={draft.estimated_cost}
                      onChange={(event) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [item.id]: {
                            ...draft,
                            estimated_cost: Number(event.target.value || 0),
                          },
                        }))
                      }
                    />
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={draft.actual_cost}
                      onChange={(event) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [item.id]: {
                            ...draft,
                            actual_cost: Number(event.target.value || 0),
                          },
                        }))
                      }
                    />
                    <Button type="button" variant="outline" onClick={() => updateItem(item.id)}>
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="destructive" onClick={() => deleteItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}

              {!budgetItems.length ? (
                <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-muted-foreground">
                  <Wallet className="h-4 w-4" />
                  <p>No budget categories yet.</p>
                </div>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
