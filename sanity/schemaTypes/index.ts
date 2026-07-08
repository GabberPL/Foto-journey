import { type SchemaTypeDefinition } from 'sanity'
import { schemaTypes as appSchemaTypes } from '../schema'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: appSchemaTypes,
}
