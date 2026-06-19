import { Model } from '@nozbe/watermelondb'
import { field, date, relation, children } from '@nozbe/watermelondb/decorators'

export default class Defect extends Model {
  static table = 'defects'
  static associations = {
    tasks: { type: 'has_many', foreignKey: 'defect_id' },
    inspections: { type: 'belongs_to', key: 'inspection_id' }
  }

  @relation('inspections', 'inspection_id') inspection
  @field('photo_url') photoUrl
  @field('ai_label') aiLabel
  @field('severity') severity
  @field('location_tag') locationTag
  @field('voice_note_url') voiceNoteUrl
  @date('resolved_at') resolvedAt

  @children('tasks') tasks
}
