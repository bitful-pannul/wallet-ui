import React from 'react';
import { FaChevronDown } from 'react-icons/fa';
import Col from '../spacing/Col';

import './Dropdown.css';
import Button from '../form/Button';

export interface DropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string | React.ReactNode;
  open: boolean;
  unstyled?: boolean;
  hideChevron?: boolean;
  toggleOpen: () => void;
}

const Dropdown = ({
  children,
  value,
  open,
  unstyled = false,
  hideChevron = false,
  toggleOpen,
  className = '',
  ...props
}: DropdownProps) => {
  return (
    <div {...props} className={`dropdown`}>
      {value}
      {open && (
        <>
          <div className="dropdown-background" onClick={toggleOpen} />
          <div className="dropdown-body" onClick={e => e.stopPropagation()}>
          {children}
          </div>
        </>
      )}
      <style>
        {`.dropdown {
            position: relative;
            display: inline-block;
        }

        .dropdown-header {
            padding: 10px;
            background-color: #ddd;
            cursor: pointer;
        }

        .dropdown-body {
            position: absolute;
            width: 100%;
            z-index: 1;
            background-color: #f1f1f1;
            box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
            border-radius: 4px;
        }

        .dropdown-background {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            right: 0;
            bottom: 0;
        }

        .dropdown-item {
            padding: 10px;
            cursor: pointer;
            border-radius: 4px;
        }

        .dropdown-item:hover {
            background-color: #ddd;
        }`}
      </style>
    </div>
  );
};

export default Dropdown;
