import { NextResponse } from "next/server"; import { db } from "@/lib/db"; import { getAdminSession } from "@/lib/auth";
export async function GET(){const data=await db.client.findMany({orderBy:{createdAt:"desc"}});return NextResponse.json(data)}
export async function POST(req:Request){if(!(await getAdminSession()))return NextResponse.json({error:"Unauthorized"},{status:401});try{const data=await req.json();const x=await db.client.create({data});return NextResponse.json(x)}catch{return NextResponse.json({error:"Invalid data"},{status:400})}}
