import { NextResponse } from "next/server"; import { db } from "@/lib/db"; import { getAdminSession } from "@/lib/auth";
export async function DELETE(req:Request,{params}:{params:Promise<{id:string}>}){if(!(await getAdminSession()))return NextResponse.json({error:"Unauthorized"},{status:401});const {id}=await params;await db.booking.delete({where:{id}});return NextResponse.json({ok:true})}
