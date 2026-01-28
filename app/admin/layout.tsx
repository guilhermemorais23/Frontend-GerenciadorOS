"use client";
// layout admin ativo

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users, Wrench, LayoutDashboard, Menu } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  return (
  <div style={{ background: "red", minHeight: "100vh", padding: 20 }}>
    <h1 style={{ color: "white", fontSize: 32 }}>
      LAYOUT ADMIN ATIVO
    </h1>
    {children}
  </div>
);

}

function SidebarButton({
  icon,
  label,
  open,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded hover:bg-gray-100 text-left"
    >
      {icon}
      {open && <span>{label}</span>}
    </button>
  );
}
