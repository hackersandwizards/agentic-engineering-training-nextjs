"use client";

import { Box, Flex, Heading, Stack, Table } from "@chakra-ui/react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useState } from "react";
import { ContactsApi, type Contact } from "@/lib/client/api";
import { AddContactDialog } from "@/components/contacts/AddContactDialog";
import { EditContactDialog } from "@/components/contacts/EditContactDialog";
import { DeleteContactDialog } from "@/components/contacts/DeleteContactDialog";
import { DataTable } from "@/components/DataTable";
import { RowActionsMenu } from "@/components/RowActionsMenu";
import { queryKeys } from "@/lib/client/queryKeys";
import {
  usePagination,
  useClampPage,
  PAGE_SIZE,
} from "@/lib/client/usePagination";

export default function ContactsPage() {
  const { page, setPage, skip, limit, prev, next } = usePagination();
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [deleteContact, setDeleteContact] = useState<Contact | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.contactsPage(page),
    queryFn: () => ContactsApi.list(skip, limit),
    placeholderData: keepPreviousData,
  });

  const contacts = data?.data || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  useClampPage(page, totalPages, setPage);

  return (
    <Box>
      <Stack gap={6}>
        <Flex justify="space-between" align="center">
          <Heading size="xl">Contacts</Heading>
          <AddContactDialog />
        </Flex>

        <DataTable
          columns={[
            { header: "Organisation" },
            { header: "Description" },
            { header: "Actions", width: "100px" },
          ]}
          items={contacts}
          isLoading={isLoading}
          isError={isError}
          error={error}
          errorMessage="Failed to load contacts"
          emptyMessage="No contacts yet. Add your first contact!"
          page={page}
          totalPages={totalPages}
          onPrev={prev}
          onNext={() => next(totalPages)}
          renderRow={(contact) => (
            <>
              <Table.Cell fontWeight="medium">
                {contact.organisation}
              </Table.Cell>
              <Table.Cell color="gray.600">
                {contact.description || "-"}
              </Table.Cell>
              <Table.Cell>
                <RowActionsMenu
                  onEdit={() => setEditContact(contact)}
                  onDelete={() => setDeleteContact(contact)}
                />
              </Table.Cell>
            </>
          )}
        />
      </Stack>

      {editContact && (
        <EditContactDialog
          contact={editContact}
          open={!!editContact}
          onOpenChange={(open) => !open && setEditContact(null)}
        />
      )}

      {deleteContact && (
        <DeleteContactDialog
          contact={deleteContact}
          open={!!deleteContact}
          onOpenChange={(open) => !open && setDeleteContact(null)}
        />
      )}
    </Box>
  );
}
