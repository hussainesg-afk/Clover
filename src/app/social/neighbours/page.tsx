import { redirect } from "next/navigation";

export default function NeighboursRedirectPage() {
  redirect("/social/friends");
}
