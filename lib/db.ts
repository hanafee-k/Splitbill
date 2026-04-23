import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

export function getDb() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma

  console.log('ENV CHECK:', { 
    hasDbUrl: !!process.env.DATABASE_URL, 
    hasDirectUrl: !!process.env.DIRECT_URL 
  })

  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
  console.log('🔌 Connecting to database...')

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  })

  pool.on('error', (err) => {
    console.error('❌ Pool error:', err)
  })

  const adapter = new PrismaPg(pool)
  const client = new PrismaClient({ adapter })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client
    globalForPrisma.pool = pool
  }
  
  return client
}

export const db = getDb()