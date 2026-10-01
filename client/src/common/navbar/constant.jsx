import { RiHome9Line } from "react-icons/ri";
import {BsFileBarGraph} from "react-icons/bs";
import { FaProjectDiagram } from "react-icons/fa";
import { IoIosGitBranch } from "react-icons/io";
import {CgFileDocument} from "react-icons/cg";
import { BsViewList } from "react-icons/bs";

const MenuLink = [
  {
    title: "Home",
    path: "/",
    icon: <RiHome9Line/>,
    adminOnly: true,
  },
  {
    title: "Sales",
    icon: <IoIosGitBranch/>,
    subMenu:[
      {
        title: "Create Sales Order",
        path: "/MenuLayout/salesentry",
      },
      {
          title:"Print Sales Order",
          path:"/MenuLayout/printorder"
      }
    ],
  },
  {
    title: "ListOrders",
    path: "/MenuLayout/orderlist",
    icon: <BsViewList/>,
  },
  
  {
    title: "Report",
    icon: <CgFileDocument/>,
    subMenu: [  
       
      {
          title:"SO Vs Invoicereport ",
          path:"/MenuLayout/ordervsinvoicereport"
      },
       /*  
      {
          title:"Outstanding Report ",
          path:"/MenuLayout/outstandingreport"
      },
      {
          title:"Sales Personwise Report ",
          path:"/MenuLayout/SalesVsPaymentPage"
      },
      {
          title:"Sales Vs Payment Register ",
          path:"/MenuLayout/SalesVsPaymentRegister"
      },
*/
      { title:"Sales Report ", path:"/MenuLayout/SalesReports" },
      { title:"Customer Outstanding List", path:"/MenuLayout/Customer OutStandingList", adminOnly: true },
    ],
  },
]

export default MenuLink;