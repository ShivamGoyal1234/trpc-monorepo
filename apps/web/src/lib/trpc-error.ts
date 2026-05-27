import { TRPCClientError } from "@trpc/client";
import { toast } from "sonner";

export function getTrpcErrorMessage(error: unknown): string {
  if (error instanceof TRPCClientError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong";
}

export function toastTrpcError(error: unknown): void {
  toast.error(getTrpcErrorMessage(error));
}
