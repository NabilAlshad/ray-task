"use client";

import { LiveUsers } from "@/components/ui/compound/LiveUsers";
import { TaskBoard } from "@/components/Tasks/TaskBoard";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <LiveUsers />
      <main className="flex-1 w-full flex flex-col pt-0">
        <TaskBoard />
      </main>
    </div>
  );
}
