import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL || "file:./prisma/dev.db";
const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

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
