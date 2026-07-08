import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL || "file:./prisma/dev.db";
const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

const BULK_CONTACTS = Number(process.env.SEED_CONTACTS ?? 30000);
const BATCH = 2000;

interface SeedContact {
  organisation: string;
  description: string;
}

async function seedUser(
  email: string,
  password: string,
  fullName: string,
  isSuperuser: boolean,
) {
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      hashedPassword: await bcrypt.hash(password, 10),
      fullName,
      isActive: true,
      isSuperuser,
    },
  });
  console.log(`Created user: ${user.email}`);
  return user;
}

async function seedContacts(
  owner: { id: string; email: string },
  contacts: SeedContact[],
) {
  for (const contact of contacts) {
    const existing = await prisma.contact.findFirst({
      where: { organisation: contact.organisation, ownerId: owner.id },
    });
    if (!existing) {
      await prisma.contact.create({
        data: {
          organisation: contact.organisation,
          description: contact.description,
          ownerId: owner.id,
        },
      });
    }
  }
  console.log(`Created ${contacts.length} contacts for ${owner.email}`);
}

// Give one non-superuser a large contact set so the unindexed owner_id filter
// and created_at sort in GET /api/v1/contacts become measurably slow.
async function seedBulkContacts(
  owner: { id: string; email: string },
  total: number,
) {
  const existing = await prisma.contact.count({ where: { ownerId: owner.id } });
  if (existing >= total) {
    console.log(
      `Bulk contacts already present for ${owner.email} (${existing}), skipping`,
    );
    return;
  }
  const toCreate = total - existing;
  console.log(`Bulk-seeding ${toCreate} contacts for ${owner.email}...`);
  for (let created = 0; created < toCreate; created += BATCH) {
    const n = Math.min(BATCH, toCreate - created);
    const data = Array.from({ length: n }, (_, i) => {
      const idx = existing + created + i;
      return {
        organisation: `Contact Org ${idx}`,
        description: `Auto-generated contact #${idx}`,
        ownerId: owner.id,
      };
    });
    await prisma.contact.createMany({ data });
    console.log(`  ${Math.min(created + n, toCreate)}/${toCreate}`);
  }
}

async function main() {
  console.log("Seeding database...");

  const superuser = await seedUser(
    process.env.FIRST_SUPERUSER_EMAIL || "dev@example.com",
    process.env.FIRST_SUPERUSER_PASSWORD || "DevPassword",
    "Dev Admin",
    true,
  );
  const alice = await seedUser(
    "alice@example.com",
    "AlicePassword123",
    "Alice Johnson",
    false,
  );
  const bob = await seedUser(
    "bob@example.com",
    "BobPassword123",
    "Bob Smith",
    false,
  );

  await seedContacts(superuser, [
    { organisation: "OpenAI", description: "AI research company" },
    { organisation: "Anthropic", description: "AI safety company" },
    { organisation: "Google DeepMind", description: "AI research lab" },
    { organisation: "Meta AI", description: "AI research division" },
    { organisation: "Microsoft Research", description: "Technology research" },
  ]);
  await seedContacts(alice, [
    { organisation: "Acme Corp", description: "Manufacturing company" },
    { organisation: "TechStart Inc", description: "Startup accelerator" },
  ]);
  await seedContacts(bob, [
    { organisation: "DataFlow Systems", description: "Data analytics" },
    { organisation: "CloudNine Hosting", description: "Cloud infrastructure" },
    { organisation: "SecureNet", description: "Cybersecurity services" },
  ]);

  await seedBulkContacts(alice, BULK_CONTACTS);

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
