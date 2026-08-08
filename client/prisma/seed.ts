import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting SmartDELHI ward seed...");

  const wards = [
    {
      number: 1,
      name: "Ward 1",
      zone: "North",
      population: null,
      households: null,
      importanceScore: 1,
      infrastructureScore: 1,
      budget: 0,
      spentBudget: 0,
    },
    {
      number: 2,
      name: "Ward 2",
      zone: "North",
      population: null,
      households: null,
      importanceScore: 1,
      infrastructureScore: 1,
      budget: 0,
      spentBudget: 0,
    },
    {
      number: 3,
      name: "Ward 3",
      zone: "North",
      population: null,
      households: null,
      importanceScore: 1,
      infrastructureScore: 1,
      budget: 0,
      spentBudget: 0,
    },
  ];

  for (const ward of wards) {
    await prisma.ward.upsert({
      where: {
        number: ward.number,
      },
      update: {
        name: ward.name,
        zone: ward.zone,
      },
      create: ward,
    });
  }

  console.log("Ward seed completed.");
}

main()
  .catch((error) => {
    console.error("SEED_ERROR:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });