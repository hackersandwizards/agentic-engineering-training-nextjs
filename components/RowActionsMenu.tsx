"use client";

import { Button, Menu, Portal } from "@chakra-ui/react";

interface RowActionsMenuProps {
  onEdit: () => void;
  onDelete?: () => void;
}

export function RowActionsMenu({ onEdit, onDelete }: RowActionsMenuProps) {
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button size="sm" variant="ghost">
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
              <Menu.Item value="delete" color="red.500" onClick={onDelete}>
                Delete
              </Menu.Item>
            )}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
