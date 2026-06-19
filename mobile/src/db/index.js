import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'

import schema from './schema'
import Site from './models/Site'
import Inspection from './models/Inspection'
import Defect from './models/Defect'
import Task from './models/Task'

const adapter = new SQLiteAdapter({
  schema,
  jsi: true,
  onSetUpError: error => {
    console.error("WatermelonDB setup error:", error)
  }
})

export const database = new Database({
  adapter,
  modelClasses: [
    Site,
    Inspection,
    Defect,
    Task,
  ],
})
