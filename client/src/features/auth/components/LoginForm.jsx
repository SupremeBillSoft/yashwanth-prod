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

// console.log("API Base URL:", import.meta.env.VITE_API_URL);

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
    const res = await api.post("/logincheck/", values);

    if (res.data.status) {
      if (res.data.data.LoPrivilege !== "User") {
        toast.success(`Welcome ${res.data.data.LoPrivilege}!`);
      } else {
        toast.success(`Welcome ${res.data.data.EmpName}!`);
      }

      const user = {
        userid: res.data.data.LoID,
        role: res.data.data.LoPrivilege,
        emp_no: res.data.data.EmpNo,
        EmpName: res.data.data.EmpName,
      };

      login(user);
      navigate("/MenuLayout", { replace: true });
      resetForm();
    } else {
      toast.error("Login Failed");
    }
  } catch (error) {
    console.log(error);
    toast.error(error.response?.data?.message || "Login error");
  } finally {
    setSubmitting(false);
  }
};

    return (
        <>
      
          <div className="min-h-screen relative overflow-hidden" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          }}>
            
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -left-20 w-40 h-40 md:w-60 md:h-60 bg-white opacity-10 rounded-full animate-pulse"></div>
              <div className="absolute top-1/4 right-10 w-20 h-20 md:w-32 md:h-32 bg-purple-300 opacity-20 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-20 left-1/4 w-16 h-16 md:w-24 md:h-24 bg-pink-300 opacity-15 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
              <div className="absolute bottom-1/3 right-1/4 w-12 h-12 md:w-20 md:h-20 bg-blue-300 opacity-25 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
            </div>

           
            <header className="relative z-10 w-full backdrop-blur-md bg-white/10 border-b border-white/20 px-4 md:px-6 py-4 shadow-lg">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-white drop-shadow-lg">
                    YASHWANTH COLOR COATINGS
                  </h1>
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-60"></div>
                </div>
              </div>
            </header>

            {/* Main content with glass morphism card */}
            <main className="relative z-10 flex-grow flex items-center justify-center px-4 py-8 md:py-12">
              <div className="w-full max-w-sm md:max-w-md lg:max-w-lg">
                {/* Glass morphism login card */}
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-8 lg:p-10 transform hover:scale-[1.02] transition-all duration-300">
                  
                  {/* Welcome section with gradient text */}
                  <div className="text-center mb-6 md:mb-8">
                    <div className="relative inline-block">
                      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-2">
                        Welcome Back
                      </h2>
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-16 md:w-20 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                    </div>
                    <p className="text-sm md:text-base text-white/80 mt-3 md:mt-4 flex items-center justify-center gap-2">
                      Hi, Welcome back
                      <span className="text-lg animate-bounce">👋</span>
                    </p>
                  </div>

                  {/* Google Login Button (commented but styled) */}
                  {/* <button
                    type="button"
                    className="flex items-center justify-center w-full backdrop-blur-sm bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl py-3 text-sm font-medium text-white hover:text-white transition-all duration-300 mb-4 group"
                  >
                    <FcGoogle className="mr-2 group-hover:scale-110 transition-transform duration-300" size={20} />
                    Login with Google
                  </button> */}

                  {/* Divider with enhanced styling */}
                  <div className="flex items-center justify-between text-sm text-white/60 mb-6 md:mb-8">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/30"></div>
                    <span className="px-4 text-white font-semibold text-xs md:text-sm backdrop-blur-sm bg-white/10 rounded-full py-1">
                      Login with UserID
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/30"></div>
                  </div>

                  {/* Enhanced Formik Form */}
                  <Formik
                    initialValues={{LoID:"",LoPassword:""}}
                    validationSchema={LoginSchema}
                    onSubmit={handleSubmit}
                  >
                    {({ isSubmitting }) => (
                      <Form className="space-y-5 md:space-y-6">
                        {/* Enhanced UserID field */}
                        <div className="group">
                          <label className="block text-sm md:text-base font-semibold text-white mb-2 group-focus-within:text-purple-200 transition-colors duration-300">
                            User ID
                          </label>
                          <div className="relative">
                            <Field
                              name="LoID"
                              type="text"
                              placeholder="E.g: john"
                              className="w-full px-4 md:px-5 py-3 md:py-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl md:rounded-2xl text-white placeholder-white/50 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 hover:bg-white/15"
                            />
                            <div className="absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-r from-purple-400/20 to-pink-400/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                          </div>
                          <ErrorMessage name="LoID" component="div" className="text-red-300 text-xs md:text-sm mt-1 ml-1" />
                        </div>

                        {/* Enhanced Password field */}
                        <div className="group">
                          <label className="block text-sm md:text-base font-semibold text-white mb-2 group-focus-within:text-purple-200 transition-colors duration-300">
                            Password
                          </label>
                          <div className="relative">
                            <Field
                              name="LoPassword"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className="w-full px-4 md:px-5 py-3 md:py-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl md:rounded-2xl text-white placeholder-white/50 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 hover:bg-white/15 pr-12"
                            />
                            <button
                              type="button"
                              className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white cursor-pointer hover:scale-110 transition-all duration-200 p-1"
                              onClick={togglePassword}
                            >
                              {showPassword ? <IoEyeOff size={18} className="md:w-5 md:h-5" /> : <IoEye size={18} className="md:w-5 md:h-5" />}
                            </button>
                            <div className="absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-r from-purple-400/20 to-pink-400/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                          </div>
                          <ErrorMessage name="LoPassword" component="div" className="text-red-300 text-xs md:text-sm mt-1 ml-1" />
                        </div>

                        {/* Remember Me + Forgot Password (commented but styled) */}
                        {/* <div className="flex justify-between items-center text-sm mb-6">
                          <label className="flex items-center space-x-2 text-white/80 cursor-pointer hover:text-white transition-colors duration-200">
                            <Field type="checkbox" name="remember" className="rounded border-white/30 bg-white/10 text-purple-500 focus:ring-purple-400/50" />
                            <span>Remember Me</span>
                          </label>
                          <a href="#" className="text-purple-200 font-medium hover:text-white hover:underline transition-all duration-200">
                            Forgot Password?
                          </a>
                        </div> */}

                        {/* Enhanced Login Button */}
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="relative w-full py-3 md:py-4 mt-6 md:mt-8 bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white rounded-xl md:rounded-2xl font-semibold text-sm md:text-base shadow-lg shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/40 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none group overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                          <span className="relative z-10">
                            {isSubmitting ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Logging in...
                              </div>
                            ) : "Sign In"}
                          </span>
                        </button>
                      </Form>
                    )}
                  </Formik>

                  {/* Enhanced Footer */}
                  <div className="text-center text-sm md:text-base mt-6 md:mt-8 text-white/70">
                    Not registered yet?{" "}
                    <a href="#" className="text-purple-200 font-semibold hover:text-white hover:underline transition-all duration-200 inline-flex items-center gap-1 group">
                      Create an account
                      <span className="group-hover:translate-x-1 transition-transform duration-200">↗</span>
                    </a>
                  </div>

                  {/* Decorative bottom accent */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 md:w-24 h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 rounded-full opacity-60"></div>
                </div>

                {/* Additional floating elements around the card */}
                <div className="absolute -top-4 -right-4 w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-30 animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 md:w-10 md:h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-40 animate-bounce" style={{animationDelay: '1s'}}></div>
              </div>
            </main>
          </div>

          {/* Additional CSS for enhanced animations */}
          <style jsx>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
            
            .animate-float {
              animation: float 3s ease-in-out infinite;
            }
            
            @media (prefers-reduced-motion: reduce) {
              .animate-bounce,
              .animate-pulse,
              .animate-float {
                animation: none;
              }
            }
          `}</style>
        </>
    )
}