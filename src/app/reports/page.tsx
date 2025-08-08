import { redirect } from "next/navigation";
export default function ReportsRoot() {
  redirect("/reports/examination");
  return null;
}
