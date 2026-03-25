import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/compound/Modal";
import {
  USER_ROLE_LABELS,
  type User,
  type UserDirectoryEntry,
} from "@/types";
import { ROLE_STYLES } from "./constants";

type SwitchUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  directoryUsers: UserDirectoryEntry[];
  canManageSavedUsers: boolean;
  onSelectPresetUser: (user: UserDirectoryEntry) => void;
  onDeletePresetUser: (userId: string) => void;
};

export function SwitchUserModal({
  isOpen,
  onClose,
  currentUser,
  directoryUsers,
  canManageSavedUsers,
  onSelectPresetUser,
  onDeletePresetUser,
}: SwitchUserModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Switch User">
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="mb-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Choose an existing user</h3>
              <p className="text-sm text-gray-500">Preset users are loaded from `data/users.json`.</p>
            </div>
          </div>

          <div className="max-h-[min(55vh,22rem)] space-y-2 overflow-y-auto pr-1">
            {directoryUsers.map((presetUser) => {
              const isCurrentSelection =
                currentUser?.name === presetUser.name &&
                currentUser?.role === presetUser.role &&
                currentUser?.color === presetUser.color;

              return (
                <div
                  key={presetUser.id}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => onSelectPresetUser(presetUser)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    aria-label={`Select saved user ${presetUser.name}`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold uppercase text-white ${presetUser.color}`}
                    >
                      {presetUser.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {presetUser.name}
                        </p>
                        {isCurrentSelection ? (
                          <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                            Current
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${ROLE_STYLES[presetUser.role]}`}
                        >
                          {USER_ROLE_LABELS[presetUser.role]}
                        </span>
                      </div>
                    </div>
                  </button>

                  {canManageSavedUsers ? (
                    <button
                      type="button"
                      onClick={() => onDeletePresetUser(presetUser.id)}
                      className="rounded-full p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      aria-label={`Delete saved user ${presetUser.name}`}
                      title={`Delete saved user ${presetUser.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
