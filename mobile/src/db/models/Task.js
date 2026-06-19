import { Model } from '@nozbe/watermelondb'
import { field, date, relation } from '@nozbe/watermelondb/decorators'

export default class Task extends Model {
  static table = 'tasks'
  static associations = {
    defects: { type: 'belongs_to', key: 'defect_id' }
  }

  @relation('defects', 'defect_id') defect
  @field('assigned_to') assignedTo
  @date('due_date') dueDate
  @field('status') status
  @field('notes') notes
  @field('created_by_ai') createdByAi
}
