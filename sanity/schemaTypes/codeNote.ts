import { defineField, defineType } from 'sanity';

export const CodeNote = defineType({
  name: 'codeNote',
  title: 'Code Note',
  type: 'document',
  fields: [
    defineField({
      name: 'key',
      title: 'Workspace key',
      type: 'string',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'text',
      rows: 10,
      validation: (rule) => rule.max(5000),
    }),
    defineField({
      name: 'expiresAt',
      title: 'Expires at',
      type: 'datetime',
      readOnly: true,
      description: 'Automatically removed after the retention period.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'key',
      expiresAt: 'expiresAt',
    },
    prepare({ title, subtitle, expiresAt }) {
      return {
        title: title || 'Untitled note',
        subtitle: `${subtitle || 'Unknown key'} • Expires ${expiresAt || 'unknown'}`,
      };
    },
  },
});
