import { PiggyBank } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const Logo = () => {
  return (
    <Link href='/' className='flex items-center gap-2'>
      <PiggyBank className='stroke h-11 w- stroke-amber-500 stroke-[1.5]' />
      <p className=' bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-3xl leading-tight tracking-tighter text-transparent'>
        BudgetTracker
      </p>
    </Link>
  );
};

export const LogoMobile = () => {
  return (
    <Link href='/' className='flex items-center gap-2'>
      <p className=' bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-3xl leading-tight tracking-tighter text-transparent'>
        BudgetTracker
      </p>
    </Link>
  );
};

export default Logo;
