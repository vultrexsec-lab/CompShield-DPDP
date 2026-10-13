import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to login for now (Step 1 base)
  redirect("/login");
}
