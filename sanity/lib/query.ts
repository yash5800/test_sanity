import { defineQuery } from "next-sanity";


export const QUERY = defineQuery(`*[_type=="post" && key == $key]|order(_createdAt desc){
    _id,
  key,
  filename,
  copiedFromId,
  "fileUrl": file.asset->url,
  "size": file.asset->size,
  _createdAt
}`)
