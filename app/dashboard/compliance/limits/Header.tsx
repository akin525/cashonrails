"use client";

const Header: React.FC<{ headerTitle: string }> = ({ headerTitle }) => {


  return (
    <>
      <header className="flex items-center justify-between p-4 border-b border-bar min-h-auto relative flex-wrap gap-2">
        <div className='flex gap-5 items-center'>
          <h1 className="md:text-lg font-medium">
            {headerTitle}
          </h1>
        </div>
      </header>
    </>
  );
};

export default Header;