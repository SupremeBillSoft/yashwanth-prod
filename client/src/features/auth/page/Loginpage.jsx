import React from 'react'
import LoginForm from '../components/LoginForm'
//import industry from '../../../assets/industry.jpg'
export default function LoginPage() {
    return (
        <>

           <div className='w-full flex h-screen'>
{/*           
            <div className='hidden md:block w-full bg-blend-darken place-content-center place-items-center'>
                 <img  src={""}  className='  '/> 
            
            </div>  */}

            <div className='w-full h-full  p-0'>
                <LoginForm/>
            </div>

            </div>

        </>
    )
}