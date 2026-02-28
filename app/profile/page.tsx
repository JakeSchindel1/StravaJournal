import { redirect } from "next/navigation";

/**
 * /profile redirects to /account. Account page is the hub for profile, journals, orders, etc.
 */
export default function ProfilePage() {
  redirect("/account");
}
