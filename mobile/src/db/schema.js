import { appSchema, tableSchema } from '@nozbe/watermelondb'

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'sites',
      columns: [
        { name: 'org_id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'address', type: 'string', isOptional: true },
        { name: 'lat', type: 'number', isOptional: true },
        { name: 'lng', type: 'number', isOptional: true },
        { name: 'type', type: 'string' },
        { name: 'created_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'inspections',
      columns: [
        { name: 'site_id', type: 'string', isIndexed: true },
        { name: 'worker_id', type: 'string' },
        { name: 'template_id', type: 'string', isOptional: true },
        { name: 'status', type: 'string' },
        { name: 'started_at', type: 'number', isOptional: true },
        { name: 'completed_at', type: 'number', isOptional: true },
        { name: 'ai_summary', type: 'string', isOptional: true },
        { name: 'pdf_url', type: 'string', isOptional: true },
      ]
    }),
    tableSchema({
      name: 'defects',
      columns: [
        { name: 'inspection_id', type: 'string', isIndexed: true },
        { name: 'photo_url', type: 'string', isOptional: true },
        { name: 'ai_label', type: 'string', isOptional: true },
        { name: 'severity', type: 'string' },
        { name: 'location_tag', type: 'string', isOptional: true },
        { name: 'voice_note_url', type: 'string', isOptional: true },
        { name: 'resolved_at', type: 'number', isOptional: true },
      ]
    }),
    tableSchema({
      name: 'tasks',
      columns: [
        { name: 'defect_id', type: 'string', isIndexed: true },
        { name: 'assigned_to', type: 'string', isOptional: true },
        { name: 'due_date', type: 'number', isOptional: true },
        { name: 'status', type: 'string' },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'created_by_ai', type: 'boolean' },
      ]
    })
  ]
})
