import React, {useState,useEffect, useContext,useRef } from 'react'
import { UserContext } from '../../context/useContext'
import { HiMenu } from 'react-icons/hi';
import ThemeSwitcher from '../ThemeSwitcher/ThemeSwitcher';

import { MdKeyboardArrowDown } from "react-icons/md";
export default function Navbar({ onMenuClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { user } = useContext(UserContext)
  console.log(user)


    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [])


  return (
    <div className='bg-white w-full flex justify-between items-center h-[80px] p-5 '
    >

      <div className='flex gap-3 items-center'>
        <button
          onClick={() => {
            //console.log("Menu clicked");
            onMenuClick()
          }}
          className='text-2xl lg:hidden text-gray-800'
        >
          <HiMenu />
        </button>
        <h1 className='font-medium text-md '>Yashwanth Color Coating</h1>
      </div>

  <div 
  className=" hidden sm:flex relative  items-center  gap-x-3 border-none w-[180px] hover:cursor-pointer border-gray-200 px-2 py-1 shadow-sm rounded-full bg-white">

<div className="flex items-center gap-3">
  <ThemeSwitcher />
  <div className="w-9 h-9 bg-purple-600 text-white flex items-center justify-center rounded-full text-sm font-semibold">
    {user?.userid?.charAt(0).toUpperCase() || 'U'}
  </div>  
</div>


  
  <div className='flex gap-x-2 items-center'>
  <div className="flex flex-col border-0">
    <span className="text-sm font-medium text-gray-800">{user?.userid} </span>
    <span className="text-xs text-gray-500 capitalize">{user?.role}</span>
  </div>

 
  


  </div>
</div>



    </div>
  )
}
