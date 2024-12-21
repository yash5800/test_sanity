import { defineQuery } from "next-sanity";


export const QUERY = defineQuery(`*[_type=="post" && !defined($search) || key match $search]|order(_createdAt desc){
    _id,
  key,
  filename,
  "fileUrl": file.asset->url,
  _createdAt
}`)
