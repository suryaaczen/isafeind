
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  userName: string | undefined;
}

const Header = ({ userName }: HeaderProps) => {
  return (
    <header className="pt-8 pb-4 px-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white">
            Hello, {userName || 'User'}
          </h1>
          <p className="text-white/80 italic">Fearless, connected, protected</p>
        </div>
        <Button variant="outline" size="icon" className="bg-white/20 backdrop-blur-sm border-white/30 text-white">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="mt-6">
        <h2 className="text-3xl text-white">
          Stay connected,<br />
          stay <span className="text-white/80">protected.</span>
        </h2>
      </div>
    </header>
  );
};

export default Header;
