import { MongoClient, ObjectId } from 'mongodb'
import type { Document } from 'mongodb'
import { config } from '../config/config.js'
import { driveLegalSeedCollections } from '../data/driveLegalPlanData.js'

function looksLikeObjectId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value)
}

function looksLikeDateKey(key: string) {
  return ['createdAt', 'updatedAt', 'effectiveFrom', 'effectiveTo', 'timestamp'].includes(key)
}

function toMongoDocument(value: unknown, key = ''): unknown {
  if (Array.isArray(value)) return value.map((entry) => toMongoDocument(entry))
  if (value === null) return value
  if (looksLikeDateKey(key) && typeof value === 'string') return new Date(value)
  if ((key === '_id' || key.endsWith('Id') || key === 'changedBy') && looksLikeObjectId(value)) return new ObjectId(value)
  if (typeof value !== 'object') return value

  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([entryKey, entryValue]) => [entryKey, toMongoDocument(entryValue, entryKey)]))
}

async function seed() {
  if (!config.mongodbUri) {
    throw new Error('MONGODB_URI is required to seed MongoDB.')
  }

  const replace = process.argv.includes('--replace')
  const client = new MongoClient(config.mongodbUri)
  await client.connect()

  try {
    const database = client.db(config.mongodbDatabase)

    for (const [name, records] of Object.entries(driveLegalSeedCollections)) {
      const target = database.collection(name)
      if (replace) await target.deleteMany({})

      const documents = records.map((record) => toMongoDocument(record) as Document)
      await target.bulkWrite(
        documents.map((document) => ({
          updateOne: {
            filter: { _id: document._id },
            update: { $set: document },
            upsert: true,
          },
        })),
        { ordered: false },
      )

      console.log(`${name}: seeded ${documents.length} records`)
    }

    await database.collection('countries').createIndex({ countryCode: 1 }, { unique: true, sparse: true })
    await database.collection('jurisdictions').createIndex({ geoBoundary: '2dsphere' })
    await database.collection('jurisdictions').createIndex({ countryId: 1, parentJurisdictionId: 1, type: 1 })
    await database.collection('vehicleTypes').createIndex({ code: 1 }, { unique: true, sparse: true })
    // create text index for laws only when no text index exists yet (MongoDB allows only one text index per collection)
    {
      const coll = database.collection('laws')
      const indexes = await coll.indexes()
      const hasText = indexes.some((i) => Object.values(i.key || {}).some((v) => v === 'text'))
      if (!hasText) {
        await coll.createIndex({ title: 'text', shortTitle: 'text', description: 'text' })
      } else {
        console.log('Skipping creation of text index on laws — text index already exists')
      }
    }
    // create text index for violations only when no text index exists
    {
      const coll = database.collection('violations')
      const indexes = await coll.indexes()
      const hasText = indexes.some((i) => Object.values(i.key || {}).some((v) => v === 'text'))
      if (!hasText) {
        await coll.createIndex({ title: 'text', keywords: 'text', code: 'text' })
      } else {
        console.log('Skipping creation of text index on violations — text index already exists')
      }
    }
    await database.collection('violations').createIndex({ code: 1 }, { unique: true, sparse: true })
    await database.collection('fineRules').createIndex({ violationId: 1, jurisdictionId: 1, vehicleTypeId: 1 })
    // create text index for legalDocuments only when no text index exists
    {
      const coll = database.collection('legalDocuments')
      const indexes = await coll.indexes()
      const hasText = indexes.some((i) => Object.values(i.key || {}).some((v) => v === 'text'))
      if (!hasText) {
        await coll.createIndex({ title: 'text', content: 'text' })
      } else {
        console.log('Skipping creation of text index on legalDocuments — text index already exists')
      }
    }
    await database.collection('users').createIndex({ email: 1 }, { unique: true, sparse: true })

    console.log(`DriveLegal seed completed for database "${config.mongodbDatabase}".`)
  } finally {
    await client.close()
  }
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
