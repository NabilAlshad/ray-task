import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";
import { useCurrentUserStore } from "@/store/useCurrentUserStore";
import { USER_ROLE_LABELS, type User } from "@/types";
import { Users } from "lucide-react";

const MOCK_USERS: Array<Omit<User, "id">> = [
  { name: "Alice 12", color: "bg-red-500", role: "ADMIN" },
  { name: "Bob 22", color: "bg-blue-500", role: "MEMBER" },
  { name: "Charlie 45", color: "bg-green-500", role: "VIEWER" },
  { name: "Diana 8", color: "bg-yellow-500", role: "ADMIN" },
  { name: "Eve 99", color: "bg-purple-500", role: "MEMBER" },
  { name: "Frank 11", color: "bg-pink-500", role: "VIEWER" },
  { name: "Grace 33", color: "bg-indigo-500", role: "ADMIN" },
  { name: "Heidi 77", color: "bg-teal-500", role: "MEMBER" },
  { name: "Ivan 12", color: "bg-orange-500", role: "VIEWER" },
  { name: "Judy 54", color: "bg-cyan-500", role: "MEMBER" },
];

const ROLE_STYLES = {
  ADMIN: "bg-red-100 text-red-700",
  MEMBER: "bg-blue-100 text-blue-700",
  VIEWER: "bg-slate-100 text-slate-700",
} as const;

function createRandomUser(): User {
  const randomUser = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];

  return { id: "", ...randomUser };
}

function mergeUsers(users: User[]) {
  return users.reduce<User[]>((acc, current) => {
    const existingUserIndex = acc.findIndex((item) => item.id === current.id);
    if (existingUserIndex === -1) {
      return acc.concat([current]);
    }

    const nextUsers = [...acc];
    nextUsers[existingUserIndex] = current;
    return nextUsers;
  }, []);
}

export function LiveUsers() {
  const currentUser = useCurrentUserStore((state) => state.currentUser);
  const setCurrentUser = useCurrentUserStore((state) => state.setCurrentUser);
  const currentUserRef = useRef<User>(currentUser ?? createRandomUser());
  const [activeUsers, setActiveUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!currentUser) {
      const initialUser = createRandomUser();
      currentUserRef.current = initialUser;
      setCurrentUser(initialUser);
      return;
    }

    currentUserRef.current = currentUser;
  }, [currentUser, setCurrentUser]);

  useEffect(() => {
    socket.on("connect", () => {
      const me = currentUserRef.current;
      const nextUser = {
        ...me,
        id: socket.id || me.id || "local-" + Math.random().toString(36).substring(2, 7),
      };

      currentUserRef.current = nextUser;
      setCurrentUser(nextUser);
      setActiveUsers((prev) => mergeUsers([...prev, nextUser]));

      if (socket.recovered) {
        return;
      }

      socket.emit("userJoined", nextUser);
    });

    socket.on("currentUser", (user: User) => {
      currentUserRef.current = user;
      setCurrentUser(user);
      setActiveUsers((prev) => mergeUsers([...prev.filter((item) => item.id !== ""), user]));
    });

    socket.on("activeUsers", (users: User[]) => {
      setActiveUsers((prev) => mergeUsers([...prev, ...users]));
    });

    socket.on("userJoined", (user: User) => {
      setActiveUsers((prev) => mergeUsers([...prev, user]));
    });

    socket.on("userLeft", (userId: string) => {
      setActiveUsers((prev) => prev.filter((user) => user.id !== userId));
    });

    return () => {
      socket.off("connect");
      socket.off("currentUser");
      socket.off("activeUsers");
      socket.off("userJoined");
      socket.off("userLeft");
    };
  }, [setCurrentUser]);

  const roleLabel = USER_ROLE_LABELS[currentUser?.role ?? "VIEWER"];
  const accessSummary =
    currentUser?.role === "ADMIN"
      ? "Full access"
      : currentUser?.role === "MEMBER"
        ? "Can create, edit, and move"
        : "Read-only";

  return (
    <div className="sticky top-0 z-10 w-full border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="mr-auto flex items-center gap-2 text-sm font-medium text-gray-500">
          <Users className="h-4 w-4" />
          <span>Live Collaboration</span>
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {activeUsers.filter((user) => user.id !== currentUser?.id).map((user) => (
            <div
              key={user.id}
              title={`${user.name} • ${USER_ROLE_LABELS[user.role]}`}
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1.5"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold uppercase text-white shadow-sm ${user.color}`}
              >
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold leading-none text-gray-800">
                  {user.name}
                </div>
                <div className="mt-1">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${ROLE_STYLES[user.role]}`}
                  >
                    {USER_ROLE_LABELS[user.role]}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {activeUsers.length === 0 ? (
            <div className="text-sm text-gray-400">Connecting...</div>
          ) : null}
        </div>

        <div className="hidden sm:flex items-center gap-4 lg:ml-4 lg:pl-6 lg:border-l lg:border-gray-200">
          <div className="flex flex-col items-end text-xs">
            <span className="font-semibold text-gray-800 text-sm">
              {currentUser?.name ?? "Connecting..."}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ROLE_STYLES[currentUser?.role ?? "VIEWER"]}`}>
                {roleLabel}
              </span>
              <span className="text-gray-400 font-medium ml-1">
                {accessSummary}
              </span>
            </div>
          </div>
          {currentUser ? (
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold uppercase text-white shadow-sm ring-2 ring-white ${currentUser.color}`}
              title="Your Profile"
            >
              {currentUser.name.charAt(0)}
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
