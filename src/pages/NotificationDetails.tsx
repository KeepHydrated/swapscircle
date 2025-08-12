import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert, ShieldAlert, Clock, Info } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ItemCarousel from '@/components/messages/details/ItemCarousel';

interface DbNotification {
  id: string;
  user_id: string;
  message: string;
  action_taken: string;
  reference_id?: string;
  status?: string;
  created_at: string;
}

interface DbItem {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  image_urls?: string[];
  status?: 'draft' | 'published' | 'removed';
  category?: string;
  condition?: string;
  tags?: string[];
  user_id?: string;
  price_range_min?: number;
  price_range_max?: number;
}

const getPrimaryImage = (item?: DbItem) => {
  if (!item) return '';
  if (item.image_url) return item.image_url;
  if (item.image_urls && item.image_urls.length > 0) return item.image_urls[0] || '';
  return '';
};

const getImageUrls = (item?: DbItem) => {
  if (!item) return [] as string[];
  if (item.image_urls && item.image_urls.length) return item.image_urls;
  if (item.image_url) return [item.image_url];
  return [] as string[];
};

const formatPriceRange = (min?: number, max?: number) => {
  if (min != null && max != null) return `$${min} - $${max}`;
  if (max != null) return `Up to $${max}`;
  if (min != null) return `$${min}+`;
  return 'Price not specified';
};

const NotificationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<DbNotification | null>(null);
  const [item, setItem] = useState<DbItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // SEO basics
  useEffect(() => {
    document.title = 'Violation Notice – Item Removed';
    const desc = 'Details about a policy violation notification and the affected item.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);

    // Canonical
    let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', `${window.location.origin}/notifications/${id}`);
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        // Get notification
        const { data: notif, error: notifErr } = await supabase
          .from('notifications')
          .select('id, user_id, message, action_taken, reference_id, status, created_at')
          .eq('id', id)
          .maybeSingle();
        if (notifErr) throw notifErr;
        setNotification(notif as DbNotification);

        // Fetch related item if available
        if (notif?.reference_id) {
          const { data: itemData, error: itemErr } = await supabase
            .from('items')
            .select('id, name, description, image_url, image_urls, status, category, condition, tags, user_id, price_range_min, price_range_max')
            .eq('id', notif.reference_id)
            .maybeSingle();
          if (itemErr) {
            console.warn('Item fetch error:', itemErr);
          } else {
            setItem(itemData as DbItem);
          }
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load notification');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const title = useMemo(() => {
    if (notification?.action_taken === 'item_removed') return 'Policy violation – Item removed';
    return 'Notification details';
  }, [notification]);

  const handleBack = () => {
    navigate('/notifications');
  };

  return (
    <MainLayout>
      <header className="mb-6">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">See your post and the removal reason side by side.</p>
      </header>

      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section aria-labelledby="item-overview" className="order-2 md:order-1">
            <h2 id="item-overview" className="sr-only">Item overview</h2>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">What you posted</h3>
                  {item?.status && (
                    <Badge>{item.status}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{notification ? new Date(notification.created_at).toLocaleString() : ''}</span>
                </div>

                {item ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="rounded-lg overflow-hidden border border-border">
                      <ItemCarousel imageUrls={getImageUrls(item)} showThumbnails={false} />
                    </div>
                    <div className="flex flex-col gap-3">
                      <div>
                        <h4 className="text-xl font-semibold leading-tight">{item.name}</h4>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-y-3 text-sm">
                        {item.category && <div className="font-medium">{item.category}</div>}
                        {item.tags && item.tags.length > 0 && <div className="font-medium">{item.tags[0]}</div>}
                        {item.condition && <div className="font-medium">{item.condition}</div>}
                        <div className="font-medium">{formatPriceRange(item.price_range_min, item.price_range_max)}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    We couldn’t load the item linked to this notification. It may have been permanently removed.
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <aside aria-labelledby="violation-details" className="order-1 md:order-2">
            <h2 id="violation-details" className="sr-only">Violation details</h2>
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-red-600" />
                  <h3 className="text-lg font-semibold">Why this was removed</h3>
                </div>
                <Separator />
                <div className="text-sm whitespace-pre-wrap">
                  {notification?.message || 'No additional details provided.'}
                </div>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Need help?</AlertTitle>
                  <AlertDescription>
                    If you think this was a mistake, you can update your item to comply with the guidelines and republish it.
                  </AlertDescription>
                </Alert>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={handleBack}>Back to notifications</Button>
                  <Button onClick={() => navigate('/profile')}>Go to your profile</Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </main>
      )}
    </MainLayout>
  );
};

export default NotificationDetails;
