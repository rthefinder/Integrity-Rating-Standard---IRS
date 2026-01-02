import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { mint } = req.query
  if (!mint || typeof mint !== 'string') return res.status(400).json({ error: 'missing mint' })
  const report = await prisma.iRSReport.findFirst({ where: { mint }, orderBy: { createdAt: 'desc' } })
  if (!report) return res.status(404).json({ error: 'not found' })
  res.json(report)
}
