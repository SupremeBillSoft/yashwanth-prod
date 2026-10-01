import React,{useState,useContext,useEffect} from "react";
//import { SiAegisauthenticator } from "react-icons/si";
import { UserContext } from "../../../context/useContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { IoEye,IoEyeOff} from "react-icons/io5";
//import { FcGoogle } from "react-icons/fc";
import * as Yup from "yup";


import { useNavigate ,} from "react-router-dom";
import axios from "axios";
import { redirect } from "react-router-dom";
import { toast } from 'react-toastify'
import api from "../../../services/api";


const LoginSchema = Yup.object().shape({
  LoID: Yup.string().required("Required"),
  LoPassword: Yup.string().required("Required"),
})


console.log("API Base URL:", import.meta.env.VITE_API_URL);
export default function LoginForm() {
    const navigate = useNavigate();
    const {login}=useContext(UserContext)
   // const [loid, setLoid] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    
    //const [lopassword,setLopassword] =useState('')
    //const [message,setMessage]=useState('')


    const togglePassword = () => setShowPassword(!showPassword)
     useEffect(()=>{
     const token= localStorage.getItem("user")
     if(token){
      navigate("/", { replace: true })
     }
           
          
     },[])

  const handleSubmit = async (values, {setSubmitting ,resetForm}) => {
    
    

    try {
      //setMessage("")
      const res = await api.post("/logincheck/",values );
      if(res.data.status) {
        toast.success(`Welcome ${res.data.data.LoPrivilege}!`);

        const user= {
           userid:res.data.data.LoID,
           role:res.data.data.LoPrivilege
        }
        //const 
        login(user)
        navigate("/",{ replace: true });
        resetForm();
        
      } else {
        //setMessage(" Login failed.");
        toast.error("Login Failed")
        
      }
    } catch (error) {
        console.log(error)
      //setMessage(error.response?.data?.message || "Login error");
      toast.error(error.response?.data?.message || "Login error");
    }finally{
      setSubmitting(false)
    }
  };
    return (
        <>
  <div className="min-h-screen  flex flex-col">
      {/* Header */}
      <header className="w-full bg-white px-6 py-4 shadow-none border-b-1 border-b-gray-200">
        <h1 className="text-xl font-bold text-purple-700">YASHWANTH COLOR COATINGS</h1>
      </header>

      {/* Centered Form */}
      <main className="flex-grow flex items-center justify-center px-4 bg-white">
        <div className="bg-white w-full max-w-md rounded-md shadow-md rounde-md p-8">
          <h2 className="text-2xl font-semibold mb-1">Login</h2>
          <p className="text-sm text-gray-500 mb-6">Hi,Welcome back👋</p>

          {/* Google Login */}
          {/* <button
            type="button"
            className="flex items-center justify-center w-full border border-gray-300 rounded-md py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 mb-3"
          >
            <FcGoogle className="mr-2" size={18} />
            Login with Google
          </button> */}

          <div className="flex items-center justify-between text-sm text-gray-400 mb-4 w-full">
            <hr className=" w-10 sm:w-1/3 " />
            <span className="text-black font-black "> Login with UserID</span>
            <hr className="w-10 sm:w-1/3" />
          </div>

          <Formik
            initialValues={{LoID:"",LoPassword:""}}
            validationSchema={LoginSchema}
             onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                {/* Email */}
                <div className="mb-4">
                  <label className="text-md font-bold text-gray-700">Userid</label>
                  <Field
                    name="LoID"
                    type="text"
                    placeholder="E.g:john"
                    className="w-full mt-1 px-4 py-2 border rounded-md text-sm focus:outline-none focus:border-none focus:ring-2 focus:ring-purple-500"
                  />
                  <ErrorMessage name="LoID" component="div" className="text-red-500 text-xs mt-1" />
                </div>

                {/* Password */}
                <div className="mb-4 relative">
                  <label className="text-md font-bold text-gray-700">Password</label>
                  <div className="relative mt-1">
                    <Field
                      name="LoPassword"
                      type={showPassword?"text":"password"}
                      //type="password"
                      placeholder="Enter your password"
                      className="w-full px-4 py-2 border rounded-md text-sm focus:border-none focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                    />
                    <div
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                      onClick={togglePassword}
                    >
                       {showPassword ? <IoEyeOff size={18} /> : <IoEye size={18} />} 
                    </div>
                  </div>
                  <ErrorMessage name="LoPassword" component="div" className="text-red-500 text-xs mt-1" />
                </div>

                {/* Remember Me + Forgot */}
                {/* <div className="flex justify-between items-center text-sm mb-6">
                  <label className="flex items-center space-x-2">
                    <Field type="checkbox" name="remember" />
                    <span>Remember Me</span>
                  </label>
                  <a href="#" className="text-purple-600 font-medium hover:underline">
                    Forgot Password?
                  </a>
                </div> */}

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 bg-purple-600 text-white rounded-md font-medium text-base hover:cursor-pointer hover:bg-purple-700 transition"
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </button>
              </Form>
            )}
          </Formik>

          {/* Footer */}
          <div className="text-center text-sm mt-6 text-gray-700">
            Not registered yet?{" "}
            <a href="#" className="text-purple-600 font-medium hover:underline">
              Create an account ↗
            </a>
          </div>
        </div>
      </main>
    </div>
        </>
    )
}