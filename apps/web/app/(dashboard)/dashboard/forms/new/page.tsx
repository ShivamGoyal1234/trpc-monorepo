"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, FilePlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { trpc } from "~/src/lib/trpc";
import { toastTrpcError } from "~/src/lib/trpc-error";
import { useOcean } from "~/src/providers/ocean-provider";

export default function NewFormPage() {
  const router = useRouter();
  const { triggerSplash } = useOcean();
  const [aiOpen, setAiOpen] = useState(false);
  const [prompt, setPrompt] = useState("");

  const createForm = trpc.forms.create.useMutation({
    onSuccess: (form) => {
      toast.success("Form created");
      router.push(`/dashboard/forms/${form.id}/edit`);
    },
    onError: toastTrpcError,
  });

  const generateForm = trpc.ai.generateForm.useMutation({
    onError: toastTrpcError,
  });

  const createField = trpc.fields.create.useMutation();

  const handleBlank = () => {
    triggerSplash();
    createForm.mutate({
      title: "Untitled form",
      description: "",
      visibility: "unlisted",
    });
  };

  const handleAi = async () => {
    if (prompt.length < 10) {
      toast.error("Describe your form in at least 10 characters");
      return;
    }
    try {
      const generated = await generateForm.mutateAsync({
        prompt,
        fieldCount: 6,
      });
      const form = await createForm.mutateAsync({
        title: generated.title,
        description: generated.description,
        visibility: "unlisted",
      });
      for (const [i, field] of generated.fields.entries()) {
        await createField.mutateAsync({
          formId: form.id,
          type: field.type,
          label: field.label,
          description: field.description ?? undefined,
          placeholder: field.placeholder ?? undefined,
          required: field.required,
          order: i,
          options: field.options ?? undefined,
          validation: field.validation ?? undefined,
        });
      }
      triggerSplash();
      toast.success("AI form generated!");
      setAiOpen(false);
      router.push(`/dashboard/forms/${form.id}/edit`);
    } catch (e) {
      toastTrpcError(e);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/forms">← Back to forms</Link>
        </Button>
        <h2 className="mt-4 text-2xl font-bold text-slate-50">Create a new form</h2>
        <p className="text-slate-400">
          Start from scratch or let AI draft your fields
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card
          className="ocean-glass cursor-pointer transition-shadow hover:border-cyan-400/30 hover:shadow-lg hover:shadow-cyan-900/20"
          onClick={handleBlank}
        >
          <CardHeader>
            <FilePlus className="size-8 text-cyan-400" />
            <CardTitle className="text-slate-50">Blank form</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-400">
            Start with an empty canvas and add fields manually.
          </CardContent>
        </Card>

        <Dialog open={aiOpen} onOpenChange={setAiOpen}>
          <DialogTrigger asChild>
            <Card className="ocean-glass cursor-pointer border-cyan-500/30 transition-shadow hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-900/20">
              <CardHeader>
                <Sparkles className="size-8 text-cyan-400" />
                <CardTitle className="text-slate-50">AI generate</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-400">
                Describe your form and we&apos;ll create fields for you.
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="ocean-glass border-white/15">
            <DialogHeader>
              <DialogTitle>Generate with AI</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="prompt">Describe your form</Label>
                <Textarea
                  id="prompt"
                  className="mt-2 min-h-32"
                  placeholder="e.g. Customer satisfaction survey for a coffee shop with rating and feedback fields"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
              <Button
                className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                onClick={handleAi}
                disabled={generateForm.isPending || createForm.isPending}
              >
                {generateForm.isPending ? "Generating…" : "Generate form"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {createForm.isPending && (
        <p className="text-center text-sm text-slate-400">Creating form…</p>
      )}
    </div>
  );
}
