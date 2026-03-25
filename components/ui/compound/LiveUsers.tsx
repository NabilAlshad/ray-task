import { type FormEvent, useCallback, useEffect, useId, useRef, useState } from "react";
import { PencilLine, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/atomic/Button";
import { socket } from "@/lib/socket";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useCurrentUserStore } from "@/store/useCurrentUserStore";
import {
  USER_ROLE_LABELS,
  type User,
  type UserDirectoryAction,
  type UserDirectoryEntry,
} from "@/types";
import { ROLE_STYLES, INITIAL_DIRECTORY_USERS, type UserColorOption } from "./live-users/constants";
import { createRandomUser, mergeUsers, persistUser, readStoredUser } from "./live-users/storage";
import { CreateUserModal } from "./live-users/CreateUserModal";
import { SwitchUserModal } from "./live-users/SwitchUserModal";

export function LiveUsers() {
  const currentUser = useCurrentUserStore((state) => state.currentUser);
  const setCurrentUser = useCurrentUserStore((state) => state.setCurrentUser);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const currentUserRef = useRef<User>(
    currentUser ?? readStoredUser() ?? createRandomUser(INITIAL_DIRECTORY_USERS),
  );

  const [directoryUsers, setDirectoryUsers] = useState<UserDirectoryEntry[]>(INITIAL_DIRECTORY_USERS);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [isSwitchUserOpen, setIsSwitchUserOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftColor, setDraftColor] = useState<UserColorOption>("bg-red-500");
  const [draftRole, setDraftRole] = useState<UserDirectoryEntry["role"]>("VIEWER");

  const roleSelectId = useId();
  const nameInputId = useId();

  useEffect(() => {
    if (!currentUser) {
      const initialUser = readStoredUser() ?? createRandomUser(directoryUsers);
      currentUserRef.current = initialUser;
      setCurrentUser(initialUser);
      persistUser(initialUser);
      return;
    }

    currentUserRef.current = currentUser;
  }, [currentUser, directoryUsers, setCurrentUser]);

  const broadcastUser = useCallback((user: User) => {
    currentUserRef.current = user;
    setCurrentUser(user);
    setActiveUsers((prev) => mergeUsers([...prev, user]));
    persistUser(user);

    if (socket.id) {
      socket.emit("userJoined", {
        ...user,
        id: socket.id,
      });
    }
  }, [setCurrentUser]);

  useEffect(() => {
    const handleConnect = () => {
      const me = currentUserRef.current;
      const nextUser = {
        ...me,
        id: socket.id || me.id || "local-" + Math.random().toString(36).substring(2, 7),
      };

      currentUserRef.current = nextUser;
      setCurrentUser(nextUser);
      setActiveUsers((prev) => mergeUsers([...prev, nextUser]));
      persistUser(nextUser);

      if (!socket.recovered) {
        socket.emit("userJoined", nextUser);
      }
    };

    const handleCurrentUser = (user: User) => {
      currentUserRef.current = user;
      setCurrentUser(user);
      setActiveUsers((prev) => mergeUsers([...prev.filter((item) => item.id !== ""), user]));
    };

    const handleActiveUsers = (users: User[]) => {
      setActiveUsers((prev) => mergeUsers([...prev, ...users]));
    };

    const handleUserDirectory = (users: UserDirectoryEntry[]) => {
      setDirectoryUsers(users);
    };

    const handleUserCreated = (createdUser: UserDirectoryEntry) => {
      addNotification({
        title: "User created",
        message: `"${createdUser.name}" was added to the saved user list.`,
        variant: "success",
      });

      broadcastUser({
        id: socket.id || currentUserRef.current.id || "",
        name: createdUser.name,
        color: createdUser.color,
        role: createdUser.role,
      });

      setIsCreateUserOpen(false);
      setIsSwitchUserOpen(false);
    };

    const handleUserDeleted = (payload: { id: string; name: string }) => {
      addNotification({
        title: "User deleted",
        message: `"${payload.name}" was removed from the saved user list.`,
        variant: "info",
      });
    };

    const handleUserDirectoryError = (payload: {
      action: UserDirectoryAction;
      message: string;
    }) => {
      addNotification({
        title: payload.action === "create" ? "Could not create user" : "Could not delete user",
        message: payload.message,
        variant: "warning",
      });
    };

    const handleUserJoined = (user: User) => {
      setActiveUsers((prev) => mergeUsers([...prev, user]));
    };

    const handleUserLeft = (userId: string) => {
      setActiveUsers((prev) => prev.filter((user) => user.id !== userId));
    };

    socket.on("connect", handleConnect);
    socket.on("currentUser", handleCurrentUser);
    socket.on("activeUsers", handleActiveUsers);
    socket.on("userDirectory", handleUserDirectory);
    socket.on("userCreated", handleUserCreated);
    socket.on("userDeleted", handleUserDeleted);
    socket.on("userDirectoryError", handleUserDirectoryError);
    socket.on("userJoined", handleUserJoined);
    socket.on("userLeft", handleUserLeft);

    return () => {
      socket.off("connect");
      socket.off("currentUser");
      socket.off("activeUsers");
      socket.off("userDirectory");
      socket.off("userCreated");
      socket.off("userDeleted");
      socket.off("userDirectoryError");
      socket.off("userJoined");
      socket.off("userLeft");
    };
  }, [addNotification, broadcastUser, setCurrentUser]);

  const roleLabel = USER_ROLE_LABELS[currentUser?.role ?? "VIEWER"];
  const accessSummary =
    currentUser?.role === "ADMIN"
      ? "Full access"
      : currentUser?.role === "MEMBER"
        ? "Can create, edit, and move"
        : "Read-only";
  const canManageSavedUsers = currentUser?.role === "ADMIN";

  const handleOpenSwitchUser = () => {
    const fallbackUser = currentUser ?? currentUserRef.current;
    setDraftName(fallbackUser.name);
    setDraftColor(fallbackUser.color as UserColorOption);
    setDraftRole(fallbackUser.role);
    setIsSwitchUserOpen(true);
  };

  const handleOpenCreateUser = () => {
    const fallbackUser = currentUser ?? currentUserRef.current;
    setDraftName("");
    setDraftColor(fallbackUser.color as UserColorOption);
    setDraftRole("VIEWER");
    setIsCreateUserOpen(true);
  };

  const handleCloseCreateUser = () => {
    setIsCreateUserOpen(false);
  };

  const handleSubmitSwitchUser = (event: FormEvent) => {
    event.preventDefault();

    const actingUser = currentUser ?? currentUserRef.current;

    if (actingUser) {
      socket.emit("userJoined", {
        id: socket.id || actingUser.id || "",
        name: actingUser.name,
        color: actingUser.color,
        role: actingUser.role,
      });
    }

    socket.emit("createUser", {
      name: draftName.trim() || "Guest",
      color: draftColor,
      role: draftRole,
    });
  };

  const handleSelectPresetUser = (presetUser: UserDirectoryEntry) => {
    broadcastUser({
      id: socket.id || currentUser?.id || currentUserRef.current.id || "",
      name: presetUser.name,
      color: presetUser.color,
      role: presetUser.role,
    });
    setIsSwitchUserOpen(false);
  };

  const handleDeletePresetUser = (userId: string) => {
    socket.emit("deleteUser", userId);
  };

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

        <div className="flex items-center justify-between gap-3 sm:justify-end lg:ml-4 lg:pl-6 lg:border-l lg:border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex flex-col text-xs sm:items-end">
              <span className="font-semibold text-gray-800 text-sm">
                {currentUser?.name ?? "Connecting..."}
              </span>
              <div className="mt-0.5 flex flex-wrap items-center gap-1 sm:justify-end">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ROLE_STYLES[currentUser?.role ?? "VIEWER"]}`}
                >
                  {roleLabel}
                </span>
                <span className="font-medium text-gray-400">{accessSummary}</span>
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

          <div className="flex items-center gap-2">
            {canManageSavedUsers ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleOpenCreateUser}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Create User
              </Button>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleOpenSwitchUser}
            >
              <PencilLine className="mr-1.5 h-3.5 w-3.5" />
              Switch User
            </Button>
          </div>
        </div>
      </div>

      <SwitchUserModal
        isOpen={isSwitchUserOpen}
        onClose={() => setIsSwitchUserOpen(false)}
        currentUser={currentUser}
        directoryUsers={directoryUsers}
        canManageSavedUsers={canManageSavedUsers}
        onSelectPresetUser={handleSelectPresetUser}
        onDeletePresetUser={handleDeletePresetUser}
      />

      <CreateUserModal
        isOpen={isCreateUserOpen}
        onClose={handleCloseCreateUser}
        draftName={draftName}
        draftColor={draftColor}
        draftRole={draftRole}
        nameInputId={nameInputId}
        roleSelectId={roleSelectId}
        onDraftNameChange={setDraftName}
        onDraftColorChange={setDraftColor}
        onDraftRoleChange={setDraftRole}
        onSubmit={handleSubmitSwitchUser}
      />
    </div>
  );
}
