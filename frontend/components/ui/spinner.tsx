"use client";

import { Loader2 } from "lucide-react";
import clsx from "clsx";

export default function Spinner({ className }: { className?: string }) {
  return <Loader2 className={clsx("animate-spin text-indigo-600", className)} />;
}
