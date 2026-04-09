"use client";

import { useEffect, useRef, useState } from "react";

import type { ArchiveItem } from "./data";

type RecordItemsPanelProps = {
  items: ArchiveItem[];
};

// 这个组件专门负责“单价条目”展示。
// 点击物品名时，会弹出一个小框；点别处后小框会自动关闭。
export default function RecordItemsPanel({ items }: RecordItemsPanelProps) {
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpenItemId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={panelRef} className="items-panel">
      {items.map((item) => (
        <div key={item.id} className="item-tile-wrap">
          <button
            type="button"
            className="item-tile"
            onClick={() => setOpenItemId((current) => (current === item.id ? null : item.id))}
          >
            <span className="item-tile-name">{item.title}</span>
            <span className="item-tile-price">{item.unitPrice.toFixed(2)}</span>
          </button>

          {openItemId === item.id && (
            <div className="item-popup">
              <p className="item-popup-title">{item.title}</p>
              <p className="item-popup-note">
                {item.note || "未能查询到该研究对象的单独图片与说明。"}
              </p>
              <p className="item-popup-tags">
                {item.tags.length > 0 ? item.tags.join(" / ") : "暂无额外标签"}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
