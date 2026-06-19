import { Model } from '@nozbe/watermelondb'
import { field, date, children, relation } from '@nozbe/watermelondb/decorators'

export default class Inspection extends Model {
  static table = 'inspections'
  static associations = {
    defects: { type: 'has_many', foreignKey: 'inspection_id' },
    sites: { type: 'belongs_to', key: 'site_id' }
  }

  @relation('sites', 'site_id') site
  @field('worker_id') workerId
  @field('template_id') templateId
  @field('status') status
  @date('started_at') startedAt
  @date('completed_at') completedAt
  @field('ai_summary') aiSummary
  @field('pdf_url') pdfUrl

  @children('defects') defects
}
