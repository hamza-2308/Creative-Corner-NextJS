import { redirect } from "next/navigation"; import { getAdminSession } from "@/lib/auth"; import { AdminDashboard } from "@/components/Admin";
export const dynamic = "force-dynamic";
export default async function Admin(){if(!(await getAdminSession()))redirect("/admin/login");return <AdminDashboard/>}
