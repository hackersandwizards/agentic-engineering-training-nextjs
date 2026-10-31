"use client";

import { Button, Menu, Portal } from "@chakra-ui/react";

interface RowActionsMenuProps {
  label: string;
  onEdit: () => void;
  onDelete?: () => void;
}

export function RowActionsMenu({
  label,
  onEdit,
  onDelete,
}: RowActionsMenuProps) {
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button size="sm" variant="ghost" aria-label={`Actions for ${label}`}>
          •••
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item value="edit" onClick={onEdit}>
              Edit
            </Menu.Item>
            {onDelete && (
              <Menu.Item value="delete" color="fg.error" onClick={onDelete}>
                Delete
              </Menu.Item>
            )}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
