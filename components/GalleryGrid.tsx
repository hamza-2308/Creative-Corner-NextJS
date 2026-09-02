"use client";
import { useState } from "react";

export default function GalleryGrid({ items }: { items: any[] }) {
  const [filter, setFilter] = useState("All");
  const cats = ["All", ...Array.from(new Set(items.map(x => x.category)))];
  const shown = filter === "All" ? items : items.filter(x => x.category === filter);

  return (
    <>
      <div className="filters">
        {cats.map(c => (
          <button
            key={c}
            className={`tag gallery-filter-btn${filter === c ? " active" : ""}`}
            onClick={() => setFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>
      {shown.length ? (
        <div className="gallery">
          {shown.map(g => (
            <div className="gallery-item" key={g.id}>
              <img src={g.image} alt={g.title} loading="lazy" />
              <div className="gallery-caption">
                <b>{g.title}</b>
                <br />
                <small>{g.category}</small>
                {g.description && <p className="gallery-desc">{g.description}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty">No items in this category yet.</div>
      )}
    </>
  );
}