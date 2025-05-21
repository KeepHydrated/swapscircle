
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SavePreferenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferenceName: string;
  setPreferenceName: (name: string) => void;
  onSave: () => void;
}

const SavePreferenceDialog: React.FC<SavePreferenceDialogProps> = ({
  open,
  onOpenChange,
  preferenceName,
  setPreferenceName,
  onSave
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Your Preferences</DialogTitle>
          <DialogDescription>
            Give your preferences a name so you can easily use them again later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="preference-name" className="col-span-4">
              Name
            </Label>
            <Input
              id="preference-name"
              placeholder="e.g., Photography Equipment"
              className="col-span-4"
              value={preferenceName}
              onChange={(e) => setPreferenceName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SavePreferenceDialog;
