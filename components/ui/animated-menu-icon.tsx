'use client';

interface AnimatedMenuIconProps {
  isOpen: boolean;
}

export function AnimatedMenuIcon({ isOpen }: AnimatedMenuIconProps) {
  return (
    <div className='relative w-5 h-5'>
      <span
        className={`absolute block h-0.5 w-5 bg-current transform transition-all duration-300 ease-in-out ${
          isOpen ? 'rotate-45 top-2' : 'rotate-0 top-0.5'
        }`}
      />
      <span
        className={`absolute block h-0.5 w-5 bg-current transform transition-all duration-300 ease-in-out top-2 ${
          isOpen ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <span
        className={`absolute block h-0.5 w-5 bg-current transform transition-all duration-300 ease-in-out ${
          isOpen ? '-rotate-45 top-2' : 'rotate-0 top-3.5'
        }`}
      />
    </div>
  );
}
