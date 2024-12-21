'use client'

import Form from 'next/form'
import { useState } from 'react'

const Key = () => {

  const [key,upkey] = useState("");
  const [isload,setload] = useState(false);
  

  return (
    <div className='mycard'>
          <h1 className='text-2xl font-bold'>Login with key <span className='hover:bg-slate-600 rounded-md'
          >🔐</span></h1>
          <Form action={(key!=="" && key.length>=4)?`/user/${key}`:'/'} onSubmit={()=>{
            setload(true)
          }}>
            <div className='flex flex-col gap-5 justify-center'>
              <input 
                 type="text" 
                 name="key"  
                 defaultValue={key}
                 className="myinput" 
                 id="key" 
                 min={4}  
                 placeholder='🗝️ Key goes here' 
                 onChange={(e)=>upkey(e.target.value)}
                 required />
              {
                (key!=="" && key.length>=4) && <div 
                className='flex justify-center'>
                   <button className='mybut'>
                    {isload ?'wait..':"🔑"}
                   </button>
                </div>
              }
            </div>
          </Form>
    </div>
  )
}

export default Key
