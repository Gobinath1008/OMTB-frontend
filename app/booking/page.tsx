import { redirect } from "next/navigation";

export default function BookingBasePage() {
  // Redirect to the customer dashboard if someone accesses /booking directly without a movie ID
  redirect("/customer");
}