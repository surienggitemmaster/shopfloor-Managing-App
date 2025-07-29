import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"


export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      async authorize(credentials, req) {
        let user = null;
        if (credentials.username === process.env.ADMIN_USERNAME && credentials.password === process.env.ADMIN_PASSWORD) {
          user = {
            id: 1,
            name: "Admin User",
            email: "admin@gmail.com",
            isAdmin: true
          }
        }

        if (credentials.username === process.env.EMP_USERNAME && credentials.password === process.env.EMP_PASSWORD) {
          user = {
            id: 2,
            name: "Emp User",
            email: "employee@gmail.com",
            isAdmin: false
          }
        }
        return user;
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
}

export default NextAuth(authOptions)
