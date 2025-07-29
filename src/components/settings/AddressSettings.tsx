
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AddressSettings: React.FC = () => {
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });
  const [loading, setLoading] = useState(false);

  const cities = [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 
    'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
    'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte',
    'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Boston'
  ];

  // Fetch current user's address profile on mount
  useEffect(() => {
    const fetchAddress = async () => {
      setLoading(true);
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('street, city, state, zip_code')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          toast.error("Failed to load address.");
        } else if (data) {
          setAddress({
            street: data.street || '',
            city: data.city || '',
            state: data.state || '',
            zipCode: data.zip_code || '',
            country: 'United States'
          });
        }
      }
      setLoading(false);
    };
    fetchAddress();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCityChange = (value: string) => {
    setAddress(prev => ({
      ...prev,
      city: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({
          street: address.street,
          city: address.city,
          state: address.state,
          zip_code: address.zipCode,
        })
        .eq('id', user.id);
      if (error) {
        toast.error("Failed to save address.");
      } else {
        toast.success('Address saved successfully');
      }
    } else {
      toast.error('You must be logged in.');
    }
    setLoading(false);
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
              disabled={loading}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Select 
                value={address.city} 
                onValueChange={handleCityChange}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input 
                id="state"
                name="state"
                value={address.state}
                onChange={handleChange}
                placeholder="California"
                disabled={loading}
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
                disabled={loading}
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
          
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Address"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddressSettings;
