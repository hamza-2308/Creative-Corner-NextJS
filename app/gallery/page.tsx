import { db } from "@/lib/db";
import GalleryGrid from "@/components/GalleryGrid";
import { Hero3D } from "@/components/Hero3D";

export const dynamic = "force-dynamic";
export default async function Gallery(){
  const items=await db.galleryItem.findMany({where:{visible:true},orderBy:{createdAt:"desc"}});
  return <>
    <section className="page-hero">
      <Hero3D/>
      <div className="container">
        <div className="eyebrow">Event Gallery</div>
        <h1>Inspiration for your next event.</h1>
        <p style={{color:"#d8cdd4"}}>{items.length} hand-crafted moments from our past celebrations.</p>
      </div>
    </section>
    <section className="section">
      <div className="container">
        <GalleryGrid items={items.map(x=>({id:x.id,title:x.title,category:x.category,image:x.image,description:x.description||""}))} />
      </div>
    </section>
  </>
}