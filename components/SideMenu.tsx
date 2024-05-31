"use client"
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RiMenu2Line } from "react-icons/ri";
import { FaMapMarkedAlt } from "react-icons/fa";
import { BsListTask } from "react-icons/bs";
import { BiLoader } from "react-icons/bi";
import { FaUserCircle } from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoImage from "@/components/image/task-link_logo.png";
import { usePathname } from 'next/navigation';

const SideMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const handleClickOutside = (event: any) => {
    if (
      sidebarRef.current &&
      !sidebarRef.current.contains(event.target) &&
      (!dropdownRef.current || !dropdownRef.current.contains(event.target))
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  const pathname = usePathname() ;

  return (
    <div className="flex">
      {isOpen && <div className={`fixed inset-0 bg-black transition-opacity duration-300 ${isOpen ? 'opacity-50' : 'opacity-0'} z-40`} onClick={() => setIsOpen(false)}></div>}
      
      <div ref={sidebarRef} className={`fixed z-50 top-0 left-0 h-full w-64 bg-sky-950 text-white md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out sidebar`}>
        <div className="p-4 -mt-6">
          <div className='flex'>
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
              <RiMenu2Line className="h-6 w-6" />
            </button>
            <Link href="/" className='flex mt-1 md:-ml-5' onClick={handleLinkClick}>
              <Image src={logoImage} width={80} height={100} alt='ロゴ' />
              <h1 className='md:text-3xl md:mt-5 font-semibold text-2xl -ml-3 mt-6'>Task-Link</h1>
            </Link>
          </div>
          <ul className='mt-10'>
            <li className={`-mr-4 -ml-5 py-3 pl-3 text-3xl flex hover:bg-gray-700 ${pathname == "/" ? "bg-gray-600 border-r-4 border-r-indigo-300" : ""}`}><Link href="/" onClick={handleLinkClick} className='flex pr-14'><FaMapMarkedAlt className='pr-2' />Taskマップ</Link></li>
            <li className={`-mr-4 -ml-5 py-3 pl-3 text-3xl flex hover:bg-gray-700 ${pathname == "/about" ? "bg-gray-600 border-r-4 border-r-indigo-300" : ""}`}><Link href="/about" onClick={handleLinkClick} className='flex pr-14'><BsListTask className='pr-2' />Taskリスト</Link></li>
            <li className={`-mr-4 -ml-5 py-3 pl-3 text-3xl flex pr-30 hover:bg-gray-700 ${pathname == "/none_1" ? "bg-gray-600 border-r-4 border-r-indigo-300" : ""}`}><Link href="/none_1" onClick={handleLinkClick} className='flex pr-30'><BiLoader className='pr-2' />None</Link></li>
            <li className={`-mr-4 -ml-5 py-3 pl-3 text-3xl flex hover:bg-gray-700 ${pathname == "/none_2" ? "bg-gray-600 border-r-4 border-r-indigo-300" : ""}`}><Link href="/none_2" onClick={handleLinkClick} className='flex pr-30'><BiLoader className='pr-2' />None</Link></li>
            <li className={`-mr-4 -ml-5 py-3 pl-3 text-3xl flex hover:bg-gray-700 ${pathname == "/none_3" ? "bg-gray-600 border-r-4 border-r-indigo-300" : ""}`}><Link href="/none_3" onClick={handleLinkClick} className='flex pr-30'><BiLoader className='pr-2' />None</Link></li>
            <li className='absolute bottom-2 left-5 mb-4'>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <FaUserCircle className="text-5xl" />
                  <div className='text-2xl mt-2'>UserName</div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Setting</DropdownMenuItem>
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          </ul>
        </div>
      </div>

      <div className={`flex-1 ml-0 md:ml-64 transition-all duration-200 ease-in-out`}>
        <header className="fixed top-0 left-0 right-0 bg-sky-950 text-white p-4 flex justify-center items-center h-16 md:hidden z-10" style={{ WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden' }}>
          {!isOpen && (
            <button onClick={() => setIsOpen(!isOpen)} className="absolute left-4">
              <RiMenu2Line className="h-6 w-6" />
            </button>
          )}
          <Link href="/">
            <h1 className='text-2xl font-bold'>Task-Link</h1>
          </Link>
        </header>
      </div>
    </div>
  );
};

export default SideMenu;
