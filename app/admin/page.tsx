import { redirect } from "next/navigation"; import { getAdminSession } from "@/lib/auth"; import { AdminDashboard } from "@/components/Admin";
export default async function Admin(){if(!(await getAdminSession()))redirect("/admin/login");return <AdminDashboard/>}
