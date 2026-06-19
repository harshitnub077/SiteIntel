import { Model } from '@nozbe/watermelondb'
import { field, date, children } from '@nozbe/watermelondb/decorators'

export default class Site extends Model {
  static table = 'sites'
  static associations = {
    inspections: { type: 'has_many', foreignKey: 'site_id' },
  }

  @field('org_id') orgId
  @field('name') name
  @field('address') address
  @field('lat') lat
  @field('lng') lng
  @field('type') type
  @date('created_at') createdAt

  @children('inspections') inspections
}
