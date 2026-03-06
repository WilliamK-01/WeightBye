"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useConfetti } from "@/hooks/use-confetti";
import { entrySchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

type FormValues = z.infer<typeof entrySchema>;

export function QuickAddForm({ todayDate }: { todayDate: string }) {
  const router = useRouter();
  const { blast } = useConfetti();
  const [conflictPayload, setConflictPayload] = useState<FormValues | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      date: todayDate,
      weight: undefined,
      waist: undefined,
      note: ""
    }
  });

  const submitPayload = async (payload: FormValues, overwrite = false) => {
    const response = await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, overwrite })
    });

    const data = await response.json();

    if (response.status === 409) {
      setConflictPayload(payload);
      return;
    }

    if (!response.ok) {
      toast.error(data.error ?? "Could not save entry");
      return;
    }

    toast.success("Entry saved", {
      description: `${data.newlyUnlocked?.length ?? 0} achievements unlocked`
    });

    if ((data.newlyUnlocked?.length ?? 0) > 0 || data.levelUp) {
      blast();
    }
    if (data.levelUp) {
      toast.success(`Level up! You are now level ${data.level}`);
    }

    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Add</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-3" onSubmit={handleSubmit((values) => submitPayload(values))}>
          <div className="space-y-1">
            <Label htmlFor="weight">Weight</Label>
            <Input id="weight" type="number" step="0.1" {...register("weight")} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="waist">Waist (optional)</Label>
            <Input id="waist" type="number" step="0.1" {...register("waist")} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="note">Note</Label>
            <Textarea id="note" rows={3} {...register("note")} />
          </div>
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Today\'s Entry"}
            </Button>
          </motion.div>
        </form>
      </CardContent>

      <Dialog open={!!conflictPayload} onOpenChange={(open) => !open && setConflictPayload(null)}>
        <DialogTrigger asChild>
          <span />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Entry already exists</DialogTitle>
            <DialogDescription>
              You already logged this date. Do you want to overwrite the existing entry?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setConflictPayload(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (conflictPayload) submitPayload(conflictPayload, true);
                setConflictPayload(null);
              }}
            >
              Overwrite
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
