"use client";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";

export function UserAvatar({
  name,
  image,
  className,
}: {
  name?: string | null;
  image?: string | null;
  className?: string;
}) {
  const initial = name?.trim().charAt(0)?.toUpperCase() ?? "?";

  return (
    <Avatar className={cn("size-8 shrink-0", className)}>
      {image?.trim() ? (
        <AvatarImage src={image.trim()} alt={name ?? "Profile"} referrerPolicy="no-referrer" />
      ) : null}
      <AvatarFallback className="bg-cyan-600 text-sm font-medium text-white">
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}
