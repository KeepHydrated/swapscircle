import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import HomeWithLocationFilter from '@/components/home/HomeWithLocationFilter';
import MyItems from '@/components/items/MyItems';
import Matches from '@/components/items/Matches';
import { Button } from '@/components/ui/button';
import { RotateCcw, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserItems } from '@/hooks/useUserItems';
import { useMatches } from '@/hooks/useMatches';
import { Card } from '@/components/ui/card';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [undoFunction, setUndoFunction] = useState<(() => void) | null>(null);
  const [undoAvailable, setUndoAvailable] = useState(false);

  // Fetch user items
  const { 
    items: userItems, 
    loading: userItemsLoading 
  } = useUserItems();

  // Get selected item object
  const selectedItem = userItems.find(item => item.id === selectedItemId) || null;

  // Fetch matches for selected item
  const { 
    matches, 
    loading: matchesLoading, 
    refreshMatches: refetchMatches 
  } = useMatches(selectedItem);

  // Set first item as selected by default
  useEffect(() => {
    if (userItems.length > 0 && !selectedItemId) {
      setSelectedItemId(userItems[0].id);
    }
  }, [userItems, selectedItemId]);

  const handleSelectItem = (itemId: string) => {
    setSelectedItemId(itemId);
  };

  const handleUndoAvailable = (available: boolean, undoFn: (() => void) | null) => {
    setUndoAvailable(available);
    setUndoFunction(() => undoFn);
  };

  const handleUndo = () => {
    if (undoFunction) {
      undoFunction();
    }
  };

  const handleRefreshMatches = () => {
    refetchMatches();
  };

  const selectedItemObject = userItems.find(item => item.id === selectedItemId);

  return (
    <MainLayout>
      <HomeWithLocationFilter>
        <div className="min-h-screen bg-background">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto p-4">
            
            {/* Left Column - My Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">My Items</h2>
                <Button 
                  onClick={() => navigate('/post-item')}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </Button>
              </div>
              
              <Card className="p-4">
                {userItems.length > 0 ? (
                  <MyItems
                    items={userItems.map(item => ({
                      id: item.id,
                      name: item.name,
                      image: item.image_urls?.[0] || item.image_url || '/placeholder.svg',
                      category: item.category,
                      condition: item.condition,
                      description: item.description,
                      tags: item.tags,
                      priceRange: item.priceRangeMin && item.priceRangeMax ? 
                        `$${item.priceRangeMin} - $${item.priceRangeMax}` : undefined
                    }))}
                    selectedItemId={selectedItemId}
                    onSelectItem={handleSelectItem}
                    loading={userItemsLoading}
                  />
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">📦</div>
                    <p className="text-lg font-medium mb-2">No items yet</p>
                    <p className="text-muted-foreground mb-4">Start trading by adding your first item</p>
                    <Button 
                      onClick={() => navigate('/post-item')}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Your First Item
                    </Button>
                  </div>
                )}
              </Card>
            </div>

            {/* Right Column - Matches */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {selectedItemObject ? `Matches for "${selectedItemObject.name}"` : 'Matches'}
                </h2>
                <div className="flex gap-2">
                  {undoAvailable && (
                    <Button
                      onClick={handleUndo}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Undo
                    </Button>
                  )}
                  <Button 
                    onClick={handleRefreshMatches}
                    variant="outline" 
                    size="sm"
                  >
                    Refresh
                  </Button>
                </div>
              </div>
              
              <Card className="p-4 min-h-[500px]">
                <Matches
                  matches={matches}
                  selectedItemName={selectedItemObject?.name || ''}
                  selectedItemId={selectedItemId}
                  onUndoAvailable={handleUndoAvailable}
                  loading={matchesLoading}
                  onRefreshMatches={handleRefreshMatches}
                />
              </Card>
            </div>
          </div>
        </div>
      </HomeWithLocationFilter>
    </MainLayout>
  );
};

export default Home;