"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Entry = {
  id: number;
  date: string;
  weight_kg: number;
  waist_cm: number | null;
  note: string | null;
};

export function LogClient({ entries }: { entries: Entry[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ date: "", weight: "", waist: "", note: "", id: 0 });
  const [isEditing, setIsEditing] = useState(false);

  const sorted = useMemo(
    () => [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [entries]
  );

  async function saveEntry() {
    const payload = {
      date: form.date,
      weight: Number(form.weight),
      waist: form.waist ? Number(form.waist) : null,
      note: form.note || null,
      overwrite: true
    };

    const response = await fetch(isEditing ? `/api/entries/${form.id}` : "/api/entries", {
      method: isEditing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      toast.error("Could not save entry");
      return;
    }

    toast.success(isEditing ? "Entry updated" : "Entry added");
    setForm({ date: "", weight: "", waist: "", note: "", id: 0 });
    setIsEditing(false);
    router.refresh();
  }

  async function removeEntry(id: number) {
    const response = await fetch(`/api/entries/${id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Delete failed");
      return;
    }
    toast.success("Entry deleted");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Entry" : "Add Entry"}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-4">
          <Input type="date" value={form.date} onChange={(e) => setForm((s) => ({ ...s, date: e.target.value }))} />
          <Input
            type="number"
            step="0.1"
            placeholder="Weight"
            value={form.weight}
            onChange={(e) => setForm((s) => ({ ...s, weight: e.target.value }))}
          />
          <Input
            type="number"
            step="0.1"
            placeholder="Waist"
            value={form.waist}
            onChange={(e) => setForm((s) => ({ ...s, waist: e.target.value }))}
          />
          <Button onClick={saveEntry}>{isEditing ? "Update" : "Add"}</Button>
          <Textarea
            className="sm:col-span-4"
            placeholder="Note"
            value={form.note}
            onChange={(e) => setForm((s) => ({ ...s, note: e.target.value }))}
          />
        </CardContent>
      </Card>

      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Entry History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Waist</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{format(new Date(entry.date), "PP")}</TableCell>
                  <TableCell>{entry.weight_kg.toFixed(1)} kg</TableCell>
                  <TableCell>{entry.waist_cm?.toFixed(1) ?? "-"}</TableCell>
                  <TableCell className="max-w-xs truncate">{entry.note || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setForm({
                            id: entry.id,
                            date: entry.date.slice(0, 10),
                            weight: String(entry.weight_kg),
                            waist: entry.waist_cm ? String(entry.waist_cm) : "",
                            note: entry.note ?? ""
                          });
                          setIsEditing(true);
                        }}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => removeEntry(entry.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:hidden">
        {sorted.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="space-y-2 pt-6">
              <div className="flex items-center justify-between">
                <p className="font-medium">{format(new Date(entry.date), "PP")}</p>
                <p>{entry.weight_kg.toFixed(1)} kg</p>
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Waist: {entry.waist_cm?.toFixed(1) ?? "-"}</p>
              {entry.note && <p className="text-sm">{entry.note}</p>}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setForm({
                      id: entry.id,
                      date: entry.date.slice(0, 10),
                      weight: String(entry.weight_kg),
                      waist: entry.waist_cm ? String(entry.waist_cm) : "",
                      note: entry.note ?? ""
                    });
                    setIsEditing(true);
                  }}
                >
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => removeEntry(entry.id)}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
