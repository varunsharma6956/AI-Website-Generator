import React from "react";

type Props = {
  pages: string[];
  selected: string;
  onSelect: (page: string) => void;
};

const PageList: React.FC<Props> = ({ pages, selected, onSelect }) => (
  <div className="page-list">
    {pages.map(page => (
      <div
        key={page}
        className={`page-item${selected === page ? " selected" : ""}`}
        onClick={() => onSelect(page)}
      >
        {page}
      </div>
    ))}
  </div>
);

export default PageList;