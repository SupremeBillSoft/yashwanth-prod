import React, { useContext, useMemo } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import MenuLink from '../navbar/constant';
import { FiLogOut } from "react-icons/fi";
import ConfirmationDialog from '../Dialogues/submitDialogue';
import { UserContext } from "../../context/useContext";

const Sidebar = ({ onClose, onLogoutClick }) => {

  const location = useLocation()
  const { user } = useContext(UserContext)

  const isActive = (path) => location.pathname === path;
  {/*sidebar only visible on large screens(>=1024px)*/ }

  // Matches the role-based check already used in ReportsPage.
  // Confirm exact casing against your DB ('Admin' vs 'admin' etc.)
  const isAdmin = user?.role === 'Admin'

  const canSee = (item) => {
    if (item.adminOnly && !isAdmin) return false
    if (item.roles && !item.roles.includes(user?.role)) return false
    return true
  }

  // Filter top-level items, and filter subMenu entries inside items that keep any.
  const visibleMenu = useMemo(() => {
    return MenuLink
      .filter(canSee)
      .map(menu => {
        if (!menu.subMenu) return menu
        const visibleSubMenu = menu.subMenu.filter(canSee)
        return { ...menu, subMenu: visibleSubMenu }
      })
      // Drop parent items whose entire subMenu got filtered out (if they have no direct path of their own)
      .filter(menu => !menu.subMenu || menu.subMenu.length > 0 || menu.path)
  }, [user])

  return (

    <>
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
        <div className="text-xl font-bold text-center py-6 border-b border-gray-100 text-gray-800">
          Order Process
        </div>

        <nav className="px-4 py-6 flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {visibleMenu.map((menu, index) => (
              <li key={index}>
                {!menu.subMenu ? (
                  <Link
                    to={menu.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${isActive(menu.path)
                        ? "bg-blue-600 text-white font-semibold"
                        : "hover:text-blue-600 hover:bg-blue-50 transition"
                      }`}
                  >
                    <span className="text-xl">{menu.icon}</span>
                    <span>{menu.title}</span>
                  </Link>
                ) : (
                  <>
                    <div className="flex items-center gap-3 px-4 py-2 text-gray-700 font-medium">
                      <span className="text-xl">{menu.icon}</span>
                      <span>{menu.title}</span>
                    </div>

                    <ul className="ml-10 mt-1 space-y-1">
                      {menu.subMenu.map((sub, subIndex) => (
                        <li key={subIndex}>
                          <Link
                            onClick={onClose}
                            to={sub.path}
                            className={`block text-sm px-3 py-1 rounded-lg transition ${isActive(sub.path)
                                ? "bg-blue-500 text-white font-semibold"
                                : "hover:text-blue-600 hover:bg-blue-50 transition"
                              }`}
                          >
                            {sub.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onLogoutClick}
            className="flex items-center w-full gap-3 text-gray-700 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition cursor-pointer"
          >
            <FiLogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

    </>
  );
};

export default Sidebar;