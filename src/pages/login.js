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
    <section className={`bg-slate-100 ${inter.className} `}>
      <div className="flex items-center justify-center mx-auto min-h-screen">
        <div className="w-full bg-white border border-slate-300 rounded-md shadow-sm md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h3 className="mb-6 text-2xl font-bold leading-tight text-center">
              ShopFloor Managing App
            </h3>
            <h1 className="text-base text-gray-600 font-semibold text-center">
              Enter credentials to sign in
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* <input name="csrfToken" type="hidden" defaultValue={csrfToken} /> */}
              <div>
                <label htmlFor="username" className="block mb-2 text-sm font-medium ">Username</label>
                <input type="text" name="username" id="username" value={credentials.username} onChange={handleChange} className="bg-gray-50 border border-gray-300 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="crater90" />

              </div>
              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium ">Password</label>
                <input type="password" name="password" id="password" value={credentials.password} onChange={handleChange} placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" />
              </div>
              {validationErrors && (<p className="text-red-500 text-sm mt-4">Please fill all the fields..</p>)}
              {/* <div className="flex items-center justify-between">
                <Link to="/forgot" className="text-sm font-medium text-primary-600 hover:underline">Forgot password?</Link>
              </div> */}
              <button type="submit" className="w-full text-white bg-blue-500 hover:bg-blue-700 font-medium rounded-md text-sm px-5 py-2.5 text-center">Sign in</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}