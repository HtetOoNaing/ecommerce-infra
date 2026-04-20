import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface StatsCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
}

export default function StatsCard({ label, value, icon: Icon, color }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={clsx("w-12 h-12 rounded-lg flex items-center justify-center text-white", color)}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}
