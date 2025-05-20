
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const AddressSettings: React.FC = () => {
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Address saved successfully');
    console.log('Address saved:', address);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Address Information</CardTitle>
        <CardDescription>
          Add your address to find items nearby.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street">Street Address</Label>
            <Input 
              id="street"
              name="street"
              value={address.street}
              onChange={handleChange}
              placeholder="123 Main St"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input 
                id="city"
                name="city"
                value={address.city}
                onChange={handleChange}
                placeholder="San Francisco"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input 
                id="state"
                name="state"
                value={address.state}
                onChange={handleChange}
                placeholder="California"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input 
                id="zipCode"
                name="zipCode"
                value={address.zipCode}
                onChange={handleChange}
                placeholder="94105"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input 
                id="country"
                name="country"
                value={address.country}
                onChange={handleChange}
                placeholder="United States"
                disabled
              />
            </div>
          </div>
          
          <Button type="submit">Save Address</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddressSettings;
