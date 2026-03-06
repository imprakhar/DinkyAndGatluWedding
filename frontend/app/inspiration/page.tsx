"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { SectionHeader } from "@/components/layout/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/ui/loading";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { usePlannerStore } from "@/store/use-planner-store";
import type { InspirationLink, OwnerType } from "@/types";

const inspirationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Enter a valid URL"),
  category: z.string().min(1, "Category is required"),
  notes: z.string().optional(),
  owner_type: z.enum(["bride", "groom", "shared"]),
});

type InspirationFormValues = z.infer<typeof inspirationSchema>;

export default function InspirationPage() {
  const ownerView = usePlannerStore((state) => state.ownerView);

  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState<InspirationLink[]>([]);
  const [search, setSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState<"all" | OwnerType>("all");

  const form = useForm<InspirationFormValues>({
    resolver: zodResolver(inspirationSchema),
    defaultValues: {
      title: "",
      url: "",
      category: "",
      notes: "",
      owner_type: ownerView,
    },
  });

  useEffect(() => {
    form.setValue("owner_type", ownerView);
  }, [ownerView, form]);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const data = await api.getLinks();
      setLinks(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load inspiration links");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const filteredLinks = useMemo(() => {
    const token = search.trim().toLowerCase();
    return links.filter((link) => {
      if (ownerFilter !== "all" && link.owner_type !== ownerFilter) return false;
      if (!token) return true;
      return (
        link.title.toLowerCase().includes(token) ||
        link.category.toLowerCase().includes(token) ||
        (link.notes ?? "").toLowerCase().includes(token)
      );
    });
  }, [links, ownerFilter, search]);

  const saveLink = form.handleSubmit(async (values) => {
    try {
      await api.createLink({
        title: values.title,
        url: values.url,
        category: values.category,
        notes: values.notes?.trim() || null,
        owner_type: values.owner_type,
      });
      toast.success("Inspiration link saved");
      form.reset({ title: "", url: "", category: "", notes: "", owner_type: ownerView });
      await fetchLinks();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save link");
    }
  });

  const removeLink = async (linkId: number) => {
    try {
      await api.deleteLink(linkId);
      toast.success("Link deleted");
      await fetchLinks();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete link");
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Inspiration Board"
        description="Save reels, pins, videos, and websites for ceremony and styling ideas."
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-[var(--font-display)] text-2xl">Save Inspiration Link</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveLink} className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Garden mandap inspiration" {...form.register("title")} />
              <p className="text-xs text-red-600">{form.formState.errors.title?.message}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Link URL</Label>
              <Input id="url" placeholder="https://..." {...form.register("url")} />
              <p className="text-xs text-red-600">{form.formState.errors.url?.message}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" placeholder="Decor, Outfit, Makeup..." {...form.register("category")} />
              <p className="text-xs text-red-600">{form.formState.errors.category?.message}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_type">Owner</Label>
              <Select id="owner_type" {...form.register("owner_type")}>
                <option value="bride">Bride</option>
                <option value="groom">Groom</option>
                <option value="shared">Shared</option>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Why this idea stands out..." {...form.register("notes")} />
            </div>

            <div className="md:col-span-2">
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" />
                Save Link
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-[var(--font-display)] text-2xl">Browse Inspiration</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by title, category, notes"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <Select
            value={ownerFilter}
            onChange={(event) => setOwnerFilter(event.target.value as typeof ownerFilter)}
          >
            <option value="all">All Owners</option>
            <option value="bride">Bride</option>
            <option value="groom">Groom</option>
            <option value="shared">Shared</option>
          </Select>
        </CardContent>
      </Card>

      {loading ? <LoadingState label="Loading inspiration board..." /> : null}

      {!loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredLinks.map((link) => (
            <Card key={link.id} className="bg-card/85">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="line-clamp-2 text-lg">{link.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{link.category}</p>
                  </div>
                  <Badge variant="secondary">
                    {link.owner_type.charAt(0).toUpperCase() + link.owner_type.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {link.notes ? <p className="line-clamp-3 text-sm text-muted-foreground">{link.notes}</p> : null}
                <div className="flex gap-2">
                  <Button asChild variant="outline" className="flex-1">
                    <a href={link.url} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Preview
                    </a>
                  </Button>
                  <Button variant="destructive" onClick={() => removeLink(link.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {!filteredLinks.length ? (
            <Card className="sm:col-span-2 xl:col-span-3">
              <CardContent className="p-8 text-center text-muted-foreground">
                No inspiration links match your filters.
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
