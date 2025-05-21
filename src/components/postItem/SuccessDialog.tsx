
import React from 'react';
import { PlusCircle } from 'lucide-react';
import { SavedPreference } from './PreferencesForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';

interface SuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPreferenceOption: string;
  setSelectedPreferenceOption: (option: string) => void;
  showPreferenceOptions: boolean;
  savedPreferences: SavedPreference[];
  selectedSavedPreferenceId: string;
  setSelectedSavedPreferenceId: (id: string) => void;
  onAddNewItem: () => void;
}

const SuccessDialog: React.FC<SuccessDialogProps> = ({
  open,
  onOpenChange,
  selectedPreferenceOption,
  setSelectedPreferenceOption,
  showPreferenceOptions,
  savedPreferences,
  selectedSavedPreferenceId,
  setSelectedSavedPreferenceId,
  onAddNewItem
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold text-green-600">
            Item Successfully Posted!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600">
            Your item has been successfully posted for trade on TradeMate.
            Would you like to add another item?
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {showPreferenceOptions && (
          <div className="my-4 border-t border-b border-gray-200 py-4">
            <Label className="font-medium mb-2 block">For your next item:</Label>
            <RadioGroup 
              value={selectedPreferenceOption} 
              onValueChange={setSelectedPreferenceOption}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="clear" id="clear" />
                <Label htmlFor="clear">Create new item with no preferences</Label>
              </div>
              {savedPreferences.length > 0 && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="load" id="load" />
                  <Label htmlFor="load">Use saved preferences</Label>
                </div>
              )}
            </RadioGroup>
            
            {selectedPreferenceOption === "load" && savedPreferences.length > 0 && (
              <div className="mt-3">
                <Select 
                  value={selectedSavedPreferenceId}
                  onValueChange={setSelectedSavedPreferenceId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select saved preferences" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedPreferences.map((pref) => (
                      <SelectItem key={pref.id} value={pref.id}>
                        {pref.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}
        
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel className="border-gray-300">
            Done
          </AlertDialogCancel>
          <AlertDialogAction onClick={onAddNewItem} className="bg-green-600 hover:bg-green-700 text-white">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SuccessDialog;
