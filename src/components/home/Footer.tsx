
import { Bell } from 'lucide-react';

const Footer = () => {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-black/80 backdrop-blur-md text-white">
      <div className="py-4 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-white" />
          <span className="text-sm">Notifications</span>
        </div>
        <h2 className="text-white text-lg">iSafe</h2>
      </div>
    </nav>
  );
};

export default Footer;
