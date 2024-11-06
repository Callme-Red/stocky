import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "../icons/icons";
import classNames from "classnames";
import { useNavigate } from "react-router-dom";

interface SubMenuProps {
  items: { name: string; url: string }[];
  activeSubItem: string | null;
  onSubItemClick: (item: string, url: string) => void;
}

function SubMenuItem({ items, activeSubItem, onSubItemClick }: SubMenuProps) {
  const [maxHeight, setMaxHeight] = useState("0px");
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (contentRef.current) {
      setMaxHeight(`${contentRef.current.scrollHeight}px`);
    }
  }, [items]);

  return (
    <div
      ref={contentRef}
      style={{ maxHeight }}
      className="overflow-hidden transition-max-height duration-300 ease-in-out"
    >
      <div className="my-1 space-y-1 w-full">
        {items.map(({ name, url }, index) => (
          <a
            key={index}
            href={url}
            onClick={(e) => {
              e.preventDefault();
              navigate(url);
              onSubItemClick(name, url);
            }}
            className={classNames(
              "flex items-center w-full cursor-pointer py-1 rounded-lg relative group",
              {
                "bg-white": activeSubItem === name,
                "bg-transparent": activeSubItem !== name,
              }
            )}
          >
            <div
              className={classNames(
                "mr-3 transition-opacity duration-200",
                {
                  "opacity-100": activeSubItem === name,
                  "opacity-0": activeSubItem !== name,
                }
              )}
            >
              <ArrowRight
                className={classNames(
                  "size-6",
                  {
                    "text-primary": activeSubItem === name,
                    "text-graying": activeSubItem !== name,
                  }
                )}
              />
            </div>
            <h3 className="text-black font-semibold text-sm">{name}</h3>
          </a>
        ))}
      </div>
    </div>
  );
}

export default SubMenuItem;
