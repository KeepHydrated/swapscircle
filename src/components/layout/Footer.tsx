import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t mt-auto bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between text-muted-foreground">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5" />
            <span className="text-base">Questions and/or comments? We'd love to hear from you.</span>
          </div>
          
          <div className="flex items-center gap-8">
            <Link to="/posting-rules" className="text-base hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link to="/posting-rules" className="text-base hover:text-foreground transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
