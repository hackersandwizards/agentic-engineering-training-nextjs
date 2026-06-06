export const queryKeys = {
  currentUser: ["currentUser"] as const,
  users: ["users"] as const,
  usersPage: (page: number) => ["users", page] as const,
  contacts: ["contacts"] as const,
  contactsPage: (page: number) => ["contacts", page] as const,
};
