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
    })
  ],
  preview:{
    select:{
       title:"key"
     }
  }
})