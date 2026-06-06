"use client";

import {
  Box,
  Button,
  Flex,
  Heading,
  Menu,
  Portal,
  Skeleton,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ContactsApi, type Contact } from "@/lib/client/api";
import { AddContactDialog } from "@/components/contacts/AddContactDialog";
import { EditContactDialog } from "@/components/contacts/EditContactDialog";
import { DeleteContactDialog } from "@/components/contacts/DeleteContactDialog";
import { Pagination } from "@/components/Pagination";
import { queryKeys } from "@/lib/client/queryKeys";
import { usePagination, PAGE_SIZE } from "@/lib/client/usePagination";

export default function ContactsPage() {
  const { page, skip, limit, prev, next } = usePagination();
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [deleteContact, setDeleteContact] = useState<Contact | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.contactsPage(page),
    queryFn: () => ContactsApi.list(skip, limit),
  });

  const contacts = data?.data || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <Box>
      <Stack gap={6}>
        <Flex justify="space-between" align="center">
          <Heading size="xl">Contacts</Heading>
          <AddContactDialog />
        </Flex>

        <Box bg="white" borderRadius="lg" boxShadow="sm" overflow="hidden">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Organisation</Table.ColumnHeader>
                <Table.ColumnHeader>Description</Table.ColumnHeader>
                <Table.ColumnHeader width="100px">Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {isLoading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <Table.Row key={i}>
                    <Table.Cell>
                      <Skeleton height="20px" />
                    </Table.Cell>
                    <Table.Cell>
                      <Skeleton height="20px" />
                    </Table.Cell>
                    <Table.Cell>
                      <Skeleton height="20px" />
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : isError ? (
                <Table.Row>
                  <Table.Cell colSpan={3}>
                    <Text textAlign="center" color="red.500" py={4}>
                      Failed to load contacts: {(error as Error).message}
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ) : contacts.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={3}>
                    <Text textAlign="center" color="gray.500" py={4}>
                      No contacts yet. Add your first contact!
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ) : (
                contacts.map((contact) => (
                  <Table.Row key={contact.id}>
                    <Table.Cell fontWeight="medium">
                      {contact.organisation}
                    </Table.Cell>
                    <Table.Cell color="gray.600">
                      {contact.description || "-"}
                    </Table.Cell>
                    <Table.Cell>
                      <Menu.Root>
                        <Menu.Trigger asChild>
                          <Button size="sm" variant="ghost">
                            •••
                          </Button>
                        </Menu.Trigger>
                        <Portal>
                          <Menu.Positioner>
                            <Menu.Content>
                              <Menu.Item
                                value="edit"
                                onClick={() => setEditContact(contact)}
                              >
                                Edit
                              </Menu.Item>
                              <Menu.Item
                                value="delete"
                                color="red.500"
                                onClick={() => setDeleteContact(contact)}
                              >
                                Delete
                              </Menu.Item>
                            </Menu.Content>
                          </Menu.Positioner>
                        </Portal>
                      </Menu.Root>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table.Root>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPrev={prev}
            onNext={() => next(totalPages)}
          />
        </Box>
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
