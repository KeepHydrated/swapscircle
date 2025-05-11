
import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ImagePlus } from 'lucide-react';

const PostItem: React.FC = () => {
  const [images, setImages] = useState<File[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files);
      setImages(prev => [...prev, ...newImages]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-6">Post New Item</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* What You're Offering Column */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-trademate-blue">What You're Offering</h2>
            
            <div className="space-y-6">
              {/* Image Upload */}
              <div>
                <Label htmlFor="images">Add Images</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
                  <ImagePlus className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Upload up to 5 images</p>
                  <input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => document.getElementById('images')?.click()}
                  >
                    Select Images
                  </Button>
                  
                  {images.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2 w-full">
                      {images.map((image, index) => (
                        <div key={index} className="relative h-20 bg-gray-100 rounded-md overflow-hidden">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="What are you offering?" />
              </div>
              
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe your item in detail..." 
                  rows={6}
                />
              </div>
            </div>
          </div>
          
          {/* What You're Looking For Column */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-trademate-blue">What You're Looking For</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="lookingFor">I'm looking for...</Label>
                <Textarea 
                  id="lookingFor" 
                  placeholder="Describe what you would like to trade for..." 
                  rows={6}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostItem;
