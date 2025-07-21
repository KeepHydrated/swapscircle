import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SavedPreference } from './PreferencesForm';

interface LoadPreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferences: SavedPreference[];
  onApply: (preference: SavedPreference) => void;
  onDelete: (id: string) => void;
}

const LoadPreferencesDialog: React.FC<LoadPreferencesDialogProps> = ({
  open,
  onOpenChange,
  preferences,
  onApply,
  onDelete
}) => {
  const handleApply = (preference: SavedPreference) => {
    onApply(preference);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Load Saved Preferences</DialogTitle>
          <DialogDescription>
            Select a saved preference to apply to your search criteria.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {preferences.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No saved preferences found.</p>
          ) : (
            preferences.map((pref) => (
              <div key={pref.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                <div>
                  <h4 className="font-medium text-gray-900">{pref.name}</h4>
                  <p className="text-sm text-gray-600">
                    {pref.selectedCategories.length > 0 && (
                      <span>Categories: {pref.selectedCategories.join(', ')}</span>
                    )}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleApply(pref)}
                  >
                    Apply
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onDelete(pref.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoadPreferencesDialog;