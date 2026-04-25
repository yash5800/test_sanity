import { type SchemaTypeDefinition } from 'sanity'
import { CodeNote } from './codeNote'
import { Post } from './post'
import { ShareLink } from './shareLink'


export const schema: { types: SchemaTypeDefinition[] } = {
  types: [Post, ShareLink, CodeNote],
}
