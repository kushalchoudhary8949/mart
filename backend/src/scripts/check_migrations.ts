import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const rows: any[] = await prisma.$queryRaw`SELECT migration_name, finished_at, rolled_back_at, applied_steps_count, logs FROM _prisma_migrations ORDER BY started_at`;
  console.log(JSON.stringify(rows, null, 2));
  
  const tables: any[] = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`;
  console.log('\n--- EXISTING TABLES ---');
  console.log(JSON.stringify(tables, null, 2));
  
  const enums: any[] = await prisma.$queryRaw`SELECT t.typname, e.enumlabel FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid ORDER BY t.typname, e.enumsortorder`;
  console.log('\n--- EXISTING ENUMS ---');
  console.log(JSON.stringify(enums, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
