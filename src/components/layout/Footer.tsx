import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  const openLiveChat = () => {
    window.dispatchEvent(new CustomEvent('open-live-chat'));
  };

  return (
    <footer className="border-t mt-auto bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <button 
            onClick={openLiveChat}
            className="flex items-center gap-2 hover:text-foreground transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Questions and/or comments? We'd love to hear from you.</span>
          </button>
          
          <div className="flex items-center gap-6">
            <Link to="/posting-rules" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link to="/posting-rules" className="hover:text-foreground transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
