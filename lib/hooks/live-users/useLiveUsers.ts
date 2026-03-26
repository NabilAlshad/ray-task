import {
  type FormEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { socket } from "@/lib/socket";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useCurrentUserStore } from "@/store/useCurrentUserStore";
import {
  USER_ROLE_LABELS,
  type LiveUsersHookResult,
  type User,
  type UserDirectoryAction,
  type UserDirectoryEntry,
} from "@/types";
import {
  ACCESS_SUMMARY_BY_ROLE,
  DEFAULT_USER_COLOR,
  DEFAULT_USER_ROLE,
  FALLBACK_CREATED_USER_NAME,
  INITIAL_DIRECTORY_USERS,
  type UserColorOption,
} from "@/data/constants";
import {
  createRandomUser,
  mergeUsers,
  persistUser,
  readStoredUser,
} from "@/components/live-users/storage";

const getFallbackUser = (
  currentUser: User | null | undefined,
  fallback: User,
) => currentUser ?? fallback;

const getSocketUserId = (userId: string | undefined) =>
  socket.id || userId || `local-${Math.random().toString(36).substring(2, 7)}`;

export function useLiveUsers(): LiveUsersHookResult {
  const currentUser = useCurrentUserStore((state) => state.currentUser);
  const setCurrentUser = useCurrentUserStore((state) => state.setCurrentUser);
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  const currentUserRef = useRef<User>(
    currentUser ??
      readStoredUser() ??
      createRandomUser(INITIAL_DIRECTORY_USERS),
  );

  const [directoryUsers, setDirectoryUsers] = useState<UserDirectoryEntry[]>(
    INITIAL_DIRECTORY_USERS,
  );
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [isSwitchUserOpen, setIsSwitchUserOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftColor, setDraftColor] =
    useState<UserColorOption>(DEFAULT_USER_COLOR);
  const [draftRole, setDraftRole] =
    useState<UserDirectoryEntry["role"]>(DEFAULT_USER_ROLE);

  const roleSelectId = useId();
  const nameInputId = useId();

  const ensureCurrentUser = useCallback(() => {
    if (!currentUser) {
      const nextUser = readStoredUser() ?? createRandomUser(directoryUsers);
      currentUserRef.current = nextUser;
      setCurrentUser(nextUser);
      persistUser(nextUser);
      return;
    }

    currentUserRef.current = currentUser;
  }, [currentUser, directoryUsers, setCurrentUser]);

  useEffect(() => {
    ensureCurrentUser();
  }, [ensureCurrentUser]);

  const updateLocalState = useCallback(
    (user: User) => {
      currentUserRef.current = user;
      setCurrentUser(user);
      setActiveUsers((prev) => mergeUsers([...prev, user]));
      persistUser(user);
    },
    [setCurrentUser],
  );

  const emitUserJoined = useCallback((user: User) => {
    if (socket.id) {
      socket.emit("userJoined", { ...user, id: socket.id });
    }
  }, []);

  const broadcastUser = useCallback(
    (user: User) => {
      updateLocalState(user);
      emitUserJoined(user);
    },
    [emitUserJoined, updateLocalState],
  );

  useEffect(() => {
    const handleConnect = () => {
      const localUser = currentUserRef.current;
      const nextUser: User = {
        ...localUser,
        id: getSocketUserId(localUser.id),
      };

      updateLocalState(nextUser);
      if (!socket.recovered) socket.emit("userJoined", nextUser);
    };

    const handleCurrentUser = (user: User) => {
      currentUserRef.current = user;
      setCurrentUser(user);
      setActiveUsers((prev) =>
        mergeUsers([...prev.filter((entry) => entry.id !== ""), user]),
      );
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
        id: getSocketUserId(currentUserRef.current.id),
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
        title:
          payload.action === "create"
            ? "Could not create user"
            : "Could not delete user",
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

    const eventMap = [
      ["connect", handleConnect],
      ["currentUser", handleCurrentUser],
      ["activeUsers", handleActiveUsers],
      ["userDirectory", handleUserDirectory],
      ["userCreated", handleUserCreated],
      ["userDeleted", handleUserDeleted],
      ["userDirectoryError", handleUserDirectoryError],
      ["userJoined", handleUserJoined],
      ["userLeft", handleUserLeft],
    ] as const;

    eventMap.forEach(([event, handler]) => socket.on(event, handler));

    return () => {
      eventMap.forEach(([event]) => socket.off(event));
    };
  }, [addNotification, broadcastUser, setCurrentUser, updateLocalState]);

  const roleLabel = USER_ROLE_LABELS[currentUser?.role ?? DEFAULT_USER_ROLE];
  const accessSummary =
    ACCESS_SUMMARY_BY_ROLE[currentUser?.role ?? DEFAULT_USER_ROLE];
  const canManageSavedUsers = currentUser?.role === "ADMIN";

  const handleOpenSwitchUser = () => {
    const fallbackUser = getFallbackUser(currentUser, currentUserRef.current);
    setDraftName(fallbackUser.name);
    setDraftColor(fallbackUser.color as UserColorOption);
    setDraftRole(fallbackUser.role);
    setIsSwitchUserOpen(true);
  };

  const handleOpenCreateUser = () => {
    const fallbackUser = getFallbackUser(currentUser, currentUserRef.current);

    setDraftName("");
    setDraftColor(fallbackUser.color as UserColorOption);
    setDraftRole(DEFAULT_USER_ROLE);
    setIsCreateUserOpen(true);
  };

  const handleSubmitSwitchUser = (event: FormEvent) => {
    event.preventDefault();

    const actingUser = getFallbackUser(currentUser, currentUserRef.current);

    socket.emit("userJoined", {
      id: getSocketUserId(actingUser.id),
      name: actingUser.name,
      color: actingUser.color,
      role: actingUser.role,
    });

    socket.emit("createUser", {
      name: draftName.trim() || FALLBACK_CREATED_USER_NAME,
      color: draftColor,
      role: draftRole,
    });
  };

  const handleSelectPresetUser = (presetUser: UserDirectoryEntry) => {
    broadcastUser({
      id: getSocketUserId(currentUser?.id ?? currentUserRef.current.id),
      name: presetUser.name,
      color: presetUser.color,
      role: presetUser.role,
    });

    setIsSwitchUserOpen(false);
  };

  const handleDeletePresetUser = (userId: string) => {
    socket.emit("deleteUser", userId);
  };

  return {
    currentUser,
    directoryUsers,
    activeUsers,
    isSwitchUserOpen,
    isCreateUserOpen,
    draftName,
    draftColor,
    draftRole,
    roleLabel,
    accessSummary,
    canManageSavedUsers,
    nameInputId,
    roleSelectId,
    setIsSwitchUserOpen,
    setIsCreateUserOpen,
    setDraftName,
    setDraftColor,
    setDraftRole,
    handleOpenSwitchUser,
    handleOpenCreateUser,
    handleSubmitSwitchUser,
    handleSelectPresetUser,
    handleDeletePresetUser,
  };
}
