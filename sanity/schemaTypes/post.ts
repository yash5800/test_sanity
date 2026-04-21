import { defineField, defineType } from "sanity";

export const Post = defineType({
  name: "post",
  title: "Post",
  type:'document',
  fields:[
    defineField({
      name: 'key',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'filename',
      type: 'string',
      readOnly: true,
      description:"File name will be automatically generated for file"
    }),
    defineField({
      name: 'file',
      type: 'file',
      description:"The uploaded file",
      options:{
        storeOriginalFilename: true,
      },
      validation:(rule)=>rule.required()
    }),
    defineField({
      name: 'size',
      type: 'number',
      readOnly: true,
      description: "File size in bytes"
    }),
    defineField({
      name: 'copiedFromId',
      type: 'string',
      readOnly: true,
      description: 'When present, this file is a clone created from another file document.'
    }),
    defineField({
      name: 'tags',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Optional labels used for search and organization.'
    }),
    defineField({
      name: 'note',
      type: 'text',
      rows: 3,
      description: 'Optional note attached to this file.'
    })
  ],
  preview:{
    select:{
       title:"key"
     }
  }
})