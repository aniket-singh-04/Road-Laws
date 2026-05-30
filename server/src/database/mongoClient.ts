import { MongoClient } from 'mongodb'
import type { Db, Document } from 'mongodb'
import { config } from '../config/config.js'
import { db as memoryStore} from '../data/store.js'

let client: MongoClient | null = null
let database: Db | null = null
let connectionState = {
  enabled: false,
  connected: false,
  message: 'MongoDB is not configured. Using in-memory store.',
}

const seededCollections = {
  countries: () => memoryStore.countries,
  states: () => memoryStore.states,
  lawCategories: () => memoryStore.lawCategories,
  laws: () => memoryStore.laws,
  violations: () => memoryStore.violations,
  legalZones: () => memoryStore.legalZones,
  vehicleTypes: () => memoryStore.vehicleTypes,
  localFineSchedules: () => memoryStore.localFineSchedules,
  vehicles: () => memoryStore.vehicles,
  challans: () => memoryStore.challans,
  notifications: () => memoryStore.notifications,
  rawTrafficRules: () => memoryStore.rawTrafficRules,
}

export function mongoStatus() {
  return { ...connectionState }
}

export function isMongoReady() {
  return Boolean(database)
}

export function collection(name: string) {
  if (!database) return null
  return database.collection(name)
}

async function seedCollection(name: string, records: Document[]) {
  if (!records.length) return
  if (!database) return
  const target = database.collection(name)
  const existing = await target.estimatedDocumentCount()
  if (existing > 0) return
  await target.insertMany(records.map((record: Document) => ({ ...record })))
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export async function connectMongo() {
  if (!config.mongodbUri) return mongoStatus()

  connectionState = {
    enabled: true,
    connected: false,
    message: 'Connecting to MongoDB...',
  }

  try {
    client = new MongoClient(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
    })
    await client.connect()
    database = client.db(config.mongodbDatabase)

    for (const [name, records] of Object.entries(seededCollections)) {
      await seedCollection(name, records())
    }

    // create a text index on laws if not already created by seed script
    try {
      await database.collection('laws').createIndex({ title: 'text', description: 'text', section: 'text', legalSource: 'text' })
    } catch (err) {
      // ignore index conflict errors
      console.warn('Could not create text index on laws:', errorMessage(err))
    }
    await database.collection('laws').createIndex({ countryId: 1, stateId: 1, categoryId: 1 })
    await database.collection('violations').createIndex({ countryId: 1, stateId: 1 })
    await database.collection('rawTrafficRules').createIndex({ stateCode: 1, approvalStatus: 1 })
    await database.collection('countries').createIndex({ countryCode: 1 }, { unique: true, sparse: true })
    await database.collection('jurisdictions').createIndex({ geoBoundary: '2dsphere' })
    await database.collection('jurisdictions').createIndex({ countryId: 1, parentJurisdictionId: 1, type: 1 })
    await database.collection('vehicleTypes').createIndex({ code: 1 }, { unique: true, sparse: true })
    await database.collection('violations').createIndex({ title: 'text', keywords: 'text', code: 'text' })
    await database.collection('violations').createIndex({ code: 1 }, { unique: true, sparse: true })
    await database.collection('fineRules').createIndex({ violationId: 1, jurisdictionId: 1, vehicleTypeId: 1 })
    await database.collection('legalDocuments').createIndex({ title: 'text', content: 'text' })
    await database.collection('users').createIndex({ email: 1 }, { unique: true, sparse: true })

    connectionState = {
      enabled: true,
      connected: true,
      message: `MongoDB connected to database "${config.mongodbDatabase}".`,
    }
  } catch (error) {
    database = null
    client = null
    connectionState = {
      enabled: true,
      connected: false,
      message: `MongoDB unavailable: ${errorMessage(error)}. Using in-memory store.`,
    }
  }

  return mongoStatus()
}
