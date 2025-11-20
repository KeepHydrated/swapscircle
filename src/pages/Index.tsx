
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to test2
    navigate('/test2');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse">
        <h1 className="text-2xl font-bold text-trademate-blue">SwapsCircle</h1>
      </div>
    </div>
  );
};

export default Index;
