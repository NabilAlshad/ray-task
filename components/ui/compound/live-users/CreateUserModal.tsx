import { type FormEvent } from "react";
import { Button } from "@/components/ui/atomic/Button";
import { Input } from "@/components/ui/atomic/Input";
import { Modal } from "@/components/ui/compound/Modal";
import { USER_ROLE_LABELS, USER_ROLES, type UserRole } from "@/types";
import { COLOR_OPTIONS, type UserColorOption } from "./constants";

type CreateUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  draftName: string;
  draftColor: UserColorOption;
  draftRole: UserRole;
  nameInputId: string;
  roleSelectId: string;
  onDraftNameChange: (value: string) => void;
  onDraftColorChange: (value: UserColorOption) => void;
  onDraftRoleChange: (value: UserRole) => void;
  onSubmit: (event: FormEvent) => void;
};

export function CreateUserModal({
  isOpen,
  onClose,
  draftName,
  draftColor,
  draftRole,
  nameInputId,
  roleSelectId,
  onDraftNameChange,
  onDraftColorChange,
  onDraftRoleChange,
  onSubmit,
}: CreateUserModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create User">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor={nameInputId} className="mb-1 block text-sm font-medium text-gray-700">
            Name
          </label>
          <Input
            id={nameInputId}
            value={draftName}
            onChange={(event) => onDraftNameChange(event.target.value)}
            placeholder="Enter a display name"
            autoFocus
            maxLength={24}
            required
          />
        </div>

        <div>
          <label htmlFor={roleSelectId} className="mb-1 block text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            id={roleSelectId}
            value={draftRole}
            onChange={(event) => onDraftRoleChange(event.target.value as UserRole)}
            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-all focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {USER_ROLES.map((role) => (
              <option key={role} value={role}>
                {USER_ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Color</p>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onDraftColorChange(color)}
                className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-105 ${color} ${
                  draftColor === color ? "border-gray-900" : "border-white"
                }`}
                aria-label={`Choose ${color.replace("bg-", "").replace("-", " ")} avatar color`}
                title={color.replace("bg-", "").replace("-", " ")}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!draftName.trim()}>
            Save User
          </Button>
        </div>
      </form>
    </Modal>
  );
}
