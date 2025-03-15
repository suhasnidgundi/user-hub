import { AuthContextProvider } from "@/context/AuthContext";
import { SessionWrapper } from "@/lib/session-wrapper";
import "bootstrap/dist/css/bootstrap.min.css";
import dynamic from "next/dynamic";
dynamic(() => import("bootstrap/dist/js/bootstrap.min.js"));

export const metadata = {
  title: "User Hub",
  description: "A user management hub",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionWrapper>
          <AuthContextProvider>
            {children}
          </AuthContextProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}