
import React from 'react';
import { Button } from '@/components/ui/button';
import { SavedPreference } from './PreferencesForm';

interface SavedPreferencesListProps {
  show: boolean;
  preferences: SavedPreference[];
  onApply: (preference: SavedPreference) => void;
  onDelete: (id: string) => void;
}

const SavedPreferencesList: React.FC<SavedPreferencesListProps> = ({
  show,
  preferences,
  onApply,
  onDelete
}) => {
  if (!show || preferences.length === 0) return null;
  
  return (
    <div className="mb-6 bg-gray-50 p-4 rounded-lg border">
      <h3 className="font-medium mb-3">Saved Preferences</h3>
      <div className="space-y-2">
        {preferences.map((pref) => (
          <div key={pref.id} className="flex items-center justify-between bg-white p-2 rounded border">
            <span className="font-medium">{pref.name}</span>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                onClick={() => onApply(pref)}
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
        ))}
      </div>
    </div>
  );
};

export default SavedPreferencesList;
