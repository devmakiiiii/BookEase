import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting seed...")

  // Create sample admin user
  const hashedAdminPassword = await hash("admin123", 10)
  const admin = await prisma.user.create({
    data: {
      email: "admin@bookease.com",
      password: hashedAdminPassword,
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
    },
  })

  // Create admin record
  await prisma.admin.create({
    data: {
      userId: admin.id,
    },
  })

  // Create sample customer
  const hashedCustomerPassword = await hash("password123", 10)
  const customer = await prisma.user.create({
    data: {
      email: "john.doe@example.com",
      password: hashedCustomerPassword,
      firstName: "John",
      lastName: "Doe",
      phone: "+1234567890",
      role: "CUSTOMER",
    },
  })

  console.log(`Created admin user: ${admin.firstName} ${admin.lastName}`)
  console.log(`Created customer: ${customer.firstName} ${customer.lastName}`)

  // Create sample services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: "Haircut",
        description: "Professional haircut service",
        duration: 30,
        price: 3500, // $35.00
      },
    }),
    prisma.service.create({
      data: {
        name: "Hair Styling",
        description: "Full hair styling and treatment",
        duration: 60,
        price: 7500, // $75.00
      },
    }),
    prisma.service.create({
      data: {
        name: "Consultation",
        description: "Free consultation for new clients",
        duration: 15,
        price: 0,
      },
    }),
  ])

  console.log(`Created ${services.length} services`)
  console.log("Seed completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
