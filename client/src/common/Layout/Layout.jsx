import React ,{useState,useEffect} from 'react'
import Sidebar from '../sidebar/sidebar'
import { Outlet,useLocation,useNavigate } from "react-router-dom";
import ConfirmationDialog from '../Dialogues/submitDialogue';
import Navbar from '../navbar/navbar';
export default function Layout() {
  const [isMobileSidebarOpen, setIsmobileSidebarOpen] = useState(false)
  const [isLogoutDialogOpen,setIsLogoutDialogOpen]=useState(false);
  const [loading,setLoading]=useState(false)
  const navigate=useNavigate();
  const location=useLocation();
  //console.log(isMobileSidebarOpen)


  const handleLogoutClick = () => {
    setIsmobileSidebarOpen(false); // close sidebar first
    setTimeout(() => {
      setIsLogoutDialogOpen(true); // open dialog after slight delay
    }, 300); // matches transition duration
  };

  const handleConfirmLogout = async () => {
    setLoading(true);
    try {
      // Your logout logic
      // e.g., await axios.post('/logout');
      // Clear tokens, cookies, etc.
      localStorage.clear();
      navigate('/');
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setLoading(false);
      setIsLogoutDialogOpen(false);
    }
  };


  useEffect(() => {
                                           // Push initial state to block the back stack
    window.history.pushState(null,'',window.location.href)

    const handlePopState=(e)=>{
                                    //Prevent navigating back by re-pushing the same URL
      navigate(location.pathname, {replace:true });
    }
    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState);
    }
  },[navigate, location.pathname])

  return (

    <>
    <div className='relative flex h-screen'>

    {/* Desktop Sidebar */}
    <div className='hidden lg:block'>
      <Sidebar  onLogoutClick={handleLogoutClick} />
    </div>

    {/* Mobile Sidebar with overlay */}
    <div
      className={`lg:hidden fixed z-[999] inset-0  transition-opacity duration-300 ${
        isMobileSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
    >
      <div className='flex h-full'>

        {/* Sidebar panel */}
        <div
          className={`w-64 h-full bg-white border-r border-gray-200 shadow-lg transform transition-transform  ease-in-out
            ${isMobileSidebarOpen ? 'translate-x-0':'-translate-x-full'}
          `}
        >
          <Sidebar onClose={()=>setIsmobileSidebarOpen(false)}
                onLogoutClick={handleLogoutClick}/>
        </div>

        {/* Overlay */}
        <div
          className='flex-1 bg-black/[30%] bg-opacity-30'
          onClick={() => setIsmobileSidebarOpen(false)}
        />
      </div>
    </div>

    {/* Main content */}
    <div className='flex flex-col flex-1 overflow-hidden'>
      <Navbar onMenuClick={() => setIsmobileSidebarOpen(true)} />
      <main className='p-1 overflow-y-auto '>
        <Outlet />
      </main>
    </div>
  </div>
  
      {/* Logout Dialog */}
      <ConfirmationDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={handleConfirmLogout}
        buttonText="Logout"
        loading={loading}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
      />
  </>

  )
}
