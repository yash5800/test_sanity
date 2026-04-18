import { sanityFetch, SanityLive } from '@/sanity/lib/live'
import { QUERY } from '@/sanity/lib/query'
import React from 'react'
import UserFilesList, { type UserFileItem } from './UserFilesList'

const UserFiles = async({uploadKey}:{uploadKey:string}) => {
  const params = {key: uploadKey}
  const {data:post} = await sanityFetch({query:QUERY,params}) 

  return (
    <>
      <UserFilesList files={post as UserFileItem[]} />
      <SanityLive/>
    </>
    
  )
}

export default UserFiles
