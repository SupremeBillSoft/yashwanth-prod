import { createContext, useState, useEffect } from "react";

export const UserContext = createContext(null);

export const UserProvider=({children})=>{
const [user,setUser]=useState(null)
const [loading, setLoading] = useState(true);
const isAuthenticated=!!user

useEffect(() => {
    const stored=localStorage.getItem("user");
    if(stored){
      setUser(JSON.parse(stored))

    }
    setLoading(false);
},[])

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user",JSON.stringify(userData))
  }


  const logout = () => {
    setUser(null);
    localStorage.removeItem("user")
  }

  return (
    <UserContext.Provider value={{ user,login,logout,isAuthenticated,loading }}>
      {children}
    </UserContext.Provider>
  )
}
