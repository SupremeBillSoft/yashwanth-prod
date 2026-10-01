import React,{useContext} from 'react'
import { Navigate,Outlet } from 'react-router-dom'
import { UserContext } from '../../context/useContext'

export default function PrivateRoute() {
    const {loading,user}=useContext(UserContext)


    if(loading) {
      return null//prevents flicker
    }
  
    if(!user) {
      return <Navigate to="/login" replace />
    }

  return  <Outlet />;

  
}
