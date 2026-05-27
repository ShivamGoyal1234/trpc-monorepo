"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChangePasswordSchema, UpdateProfileSchema } from "@repo/schemas";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { UserAvatar } from "~/src/components/user-avatar";
import { trpc } from "~/src/lib/trpc";
import { toastTrpcError } from "~/src/lib/trpc-error";
import { useAuthStore } from "~/src/store/auth.store";

type ProfileForm = z.infer<typeof UpdateProfileSchema>;
type PasswordForm = z.infer<typeof ChangePasswordSchema>;

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);

  const { data: me } = trpc.auth.me.useQuery(undefined, {
    enabled: Boolean(token),
  });

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(UpdateProfileSchema),
    values: {
      name: me?.name ?? user?.name ?? "",
      image: me?.image ?? user?.image ?? null,
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const utils = trpc.useUtils();

  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: (updated) => {
      if (token) {
        setAuth(
          {
            id: updated.id,
            email: updated.email,
            name: updated.name,
            image: updated.image,
            role: updated.role,
          },
          token,
        );
      }
      void utils.auth.me.invalidate();
      toast.success("Profile updated");
    },
    onError: toastTrpcError,
  });

  const previewName = profileForm.watch("name");
  const previewImage = profileForm.watch("image");

  const changePassword = trpc.auth.changePassword.useMutation({
    onSuccess: (result) => {
      if (user && result.token) {
        setAuth(user, result.token);
      }
      toast.success("Password changed");
      passwordForm.reset();
    },
    onError: toastTrpcError,
  });

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage your account</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>{user?.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center gap-4">
            <UserAvatar
              name={previewName || user?.name}
              image={previewImage}
              className="size-16"
            />
            <p className="text-sm text-muted-foreground">
              Preview updates as you type. Save profile to apply everywhere.
            </p>
          </div>
          <Form {...profileForm}>
            <form
              onSubmit={profileForm.handleSubmit((values) =>
                updateProfile.mutate({
                  name: values.name,
                  image: values.image?.trim() ? values.image.trim() : null,
                }),
              )}
              className="space-y-4"
            >
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="https://…"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className=""
                disabled={updateProfile.isPending}
              >
                Save profile
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit((values) =>
                changePassword.mutate(values),
              )}
              className="space-y-4"
            >
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                variant="outline"
                disabled={changePassword.isPending}
              >
                Update password
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
