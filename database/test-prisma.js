const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('Доступные модели:', Object.keys(prisma).filter(key => !key.startsWith('$') && !key.startsWith('_')));
console.log('prisma.gift:', !!prisma.gift);
console.log('prisma.user:', !!prisma.user);
