import { signIn } from "next-auth/react";
import { useState } from "react"
import { Inter } from "next/font/google";
import { useRouter } from "next/router";
import toast from "react-hot-toast";


const inter = Inter({ subsets: ["latin"] });

export default function Signin() {
  const [validationErrors, setValidationErrors] = useState(false);
  const router = useRouter();

  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  })

  const [loginErrors, setLoginErrors] = useState(false);

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setCredentials(prev => ({ ...prev, [name]: value }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((credentials.username === "") || (credentials.password === "")) {
      setValidationErrors(true);
      return;
    }
    const toastId = toast.loading("Signing in...");
    signIn("credentials", { username: credentials.username, password: credentials.password, callbackUrl: '/', redirect: false })
      .then((res) => {
        if (res.ok) {
          toast.success("Sign In Successfull !");
          router.push('/');
        }
        else toast.error("Invalid Credentials...");
      }).catch((err) => {
        toast.error("Something went wrong...");
      }).finally(() => toast.dismiss(toastId));
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 ${inter.className}`}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          <div className="card p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600">Sign in to your ShopFloor Manager account</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input 
                  type="text" 
                  name="username" 
                  id="username" 
                  value={credentials.username} 
                  onChange={handleChange} 
                  className="input-field" 
                  placeholder="Enter your username" 
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input 
                  type="password" 
                  name="password" 
                  id="password" 
                  value={credentials.password} 
                  onChange={handleChange} 
                  placeholder="Enter your password" 
                  className="input-field" 
                />
              </div>
              
              {validationErrors && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">Please fill in all required fields.</p>
                </div>
              )}
              
              <button 
                type="submit" 
                className="w-full btn-primary py-3 text-base font-medium"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}