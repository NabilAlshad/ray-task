import { Suspense, lazy, type ComponentType } from "react";
import { PencilLine, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/atomic/Button";
import type { CreateUserModalProps } from "./CreateUserModal";
import type { SwitchUserModalProps } from "./SwitchUserModal";
import { useLiveUsers } from "@/lib/hooks/live-users/useLiveUsers";
import { USER_ROLE_LABELS } from "@/types";
import {
  CONNECTING_LABEL,
  DEFAULT_USER_ROLE,
  LIVE_COLLABORATION_TITLE,
  ROLE_STYLES,
} from "@/data/constants";

// Lazy load modals for better performance with proper component typing
const LazyCreateUserModal = lazy(() =>
  import("./CreateUserModal").then((mod) => ({
    default: mod.CreateUserModal as ComponentType<CreateUserModalProps>,
  })),
);
const LazySwitchUserModal = lazy(() =>
  import("./SwitchUserModal").then((mod) => ({
    default: mod.SwitchUserModal as ComponentType<SwitchUserModalProps>,
  })),
);

export function LiveUsers() {
  const {
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
    handleOpenCreateUser,
    handleOpenSwitchUser,
    handleSubmitSwitchUser,
    handleSelectPresetUser,
    handleDeletePresetUser,
  } = useLiveUsers();

  return (
    <div className="sticky top-0 z-10 w-full border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="mr-auto flex items-center gap-2 text-sm font-medium text-gray-500">
          <Users className="h-4 w-4" />
          <span>{LIVE_COLLABORATION_TITLE}</span>
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {activeUsers
            .filter((user) => user.id !== currentUser?.id)
            .map((user) => (
              <div
                key={user.id}
                title={`${user.name} • ${user.role}`}
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1.5 cursor-pointer"
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
          {!activeUsers.length ? (
            <div className="text-sm text-gray-400">{CONNECTING_LABEL}</div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end lg:ml-4 lg:pl-6 lg:border-l lg:border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex flex-col text-xs sm:items-end">
              <span className="font-semibold text-gray-800 text-sm">
                {currentUser?.name ?? CONNECTING_LABEL}
              </span>
              <div className="mt-0.5 flex flex-wrap items-center gap-1 sm:justify-end">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ROLE_STYLES[currentUser?.role ?? DEFAULT_USER_ROLE]}`}
                  aria-label={`${roleLabel} role`}
                >
                  {roleLabel}
                </span>
                <span className="font-medium text-gray-400">
                  {accessSummary}
                </span>
              </div>
            </div>

            {currentUser ? (
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold uppercase text-white shadow-sm ring-2 ring-white ${currentUser.color}`}
              >
                {currentUser.name.charAt(0)}
              </div>
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
            )}
          </div>

          <div className="flex items-center gap-2">
            {canManageSavedUsers && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleOpenCreateUser}
                aria-label="Create User"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Create User
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleOpenSwitchUser}
              aria-label="Switch User"
            >
              <PencilLine className="mr-1.5 h-3.5 w-3.5" />
              Switch User
            </Button>
          </div>
        </div>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <LazySwitchUserModal
          isOpen={isSwitchUserOpen}
          onClose={() => setIsSwitchUserOpen(false)}
          currentUser={currentUser}
          directoryUsers={directoryUsers}
          canManageSavedUsers={canManageSavedUsers}
          onSelectPresetUser={handleSelectPresetUser}
          onDeletePresetUser={handleDeletePresetUser}
        />
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <LazyCreateUserModal
          isOpen={isCreateUserOpen}
          onClose={() => setIsCreateUserOpen(false)}
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
      </Suspense>
    </div>
  );
}
