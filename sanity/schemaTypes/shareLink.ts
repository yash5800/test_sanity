import { defineField, defineType } from 'sanity';

export const ShareLink = defineType({
  name: 'shareLink',
  title: 'Share Link',
  type: 'document',
  fields: [
    defineField({
      name: 'file',
      type: 'reference',
      to: [{ type: 'post' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tokenHash',
      type: 'string',
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'expiresAt',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'passcodeHash',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'passcodeSalt',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'revoked',
      type: 'boolean',
      initialValue: false,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'accessCount',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'lastAccessedAt',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      fileName: 'file.filename',
      expiresAt: 'expiresAt',
      revoked: 'revoked',
    },
    prepare({ fileName, expiresAt, revoked }) {
      return {
        title: fileName || 'Shared file',
        subtitle: `${revoked ? 'Revoked' : 'Active'} • Expires ${expiresAt || 'unknown'}`,
      };
    },
  },
});
