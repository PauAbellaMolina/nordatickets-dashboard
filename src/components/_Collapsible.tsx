import React from 'react';

interface CollapsibleProps {
  children: React.ReactNode;
  isOpen: boolean;
}

const Collapsible: React.FC<CollapsibleProps> = ({ children, isOpen }) => {
  return (
    <div>
      {isOpen && <div>{children}</div>}
    </div>
  );
};

export default Collapsible;