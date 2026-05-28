 /* eslint-disable */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const testimonials = await prisma.testimonial.findMany();
  console.log("All Testimonials in Database:");
  console.log(JSON.stringify(testimonials, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
