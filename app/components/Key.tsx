'use client'

import Form from 'next/form'
import Image from 'next/image';
import { useState } from 'react'

const Key = () => {
  const [error,seterror] = useState<Record<string,string>>({});
  const [key,upkey] = useState("");
  const [isload,setload] = useState(false);
  

  const handleInsertKey =async()=>{
      setload(true);
      try{
        if(key.trim()!=="" && key.trim().length>=4){
          window.location.href = `/user/${key}`;
        }
        else{
          seterror({
            key:"Atleast 4 characters required"
          })
        }
      }finally{
      setload(false);
      }
  }
  

  return (
    <div className='mycard'>
          <h1 className='text-2xl font-bold'>Login with key <span className='hover:bg-slate-600 rounded-md'
          >🔐</span></h1>
          <Form action={handleInsertKey}>
            <div className='flex flex-col gap-2 justify-center'>
              <input 
                 type="text" 
                 name="key"  
                 defaultValue={key}
                 className="myinput" 
                 id="key" 
                 min={4}  
                 placeholder='🗝️ Key goes here' 
                 onChange={(e)=>upkey(e.target.value)}
                 autoComplete='off'
                 required />
                {error.key && <p className="text-red-500 text-sm ">{error.key}</p>}
                <div 
                className='flex justify-center'>
                   <button type='submit' className='mybut flex justify-center items-center gap-2'>
                    {isload ?'wait..':"Insert"}
                    {key && <Image src={"/move-right.png"} className='myim' alt='arrow' width={25} height={25} />}
                   </button>
                </div>
                
            </div>
          </Form>
    </div>
  )
}

export default Key
