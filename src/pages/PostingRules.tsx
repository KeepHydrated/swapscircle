import React, { useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ShieldAlert, Image as ImageIcon, Tag, HandCoins, Info } from 'lucide-react';

const PostingRules: React.FC = () => {
  // Basic SEO
  useEffect(() => {
    const title = 'Posting Rules and Guidelines';
    document.title = title;

    const desc = 'Posting rules for TradeMate: what you can list, what’s prohibited, and how to create high‑quality listings.';
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
    link.setAttribute('href', `${window.location.origin}/posting-rules`);

    // Structured data (FAQ)
    const faqLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What items are prohibited?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Illegal items, weapons, adult content, counterfeit goods, recalled items, endangered species, and anything that promotes harm are not allowed.'
          }
        },
        {
          '@type': 'Question',
          name: 'How should I price my item?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Use a fair, realistic value. Include a price range if you are open to offers or trades. Misleading pricing or hidden conditions is not permitted.'
          }
        },
        {
          '@type': 'Question',
          name: 'What photo standards apply?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Upload clear, unedited photos of the actual item you own. No stock photos, watermarks, or images with personal information. At least one main photo is required.'
          }
        },
        {
          '@type': 'Question',
          name: 'Can I post the same item multiple times?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Duplicate or spam listings are not allowed. Update your existing post instead of creating duplicates.'
          }
        }
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(faqLd);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <MainLayout>
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Posting Rules and Guidelines</h1>
        <p className="text-muted-foreground mt-1 text-sm">Keep TradeMate safe and fair. Review these rules before posting.</p>
      </header>

      <main className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-600" />
              <h2 className="text-xl font-semibold">Prohibited items</h2>
            </div>
            <Separator />
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Illegal items, weapons, explosives, or hazardous materials.</li>
              <li>Drugs, alcohol, tobacco, or related paraphernalia.</li>
              <li>Adult content or services; explicit or suggestive material.</li>
              <li>Counterfeit, stolen, recalled, or otherwise infringing goods.</li>
              <li>Animals (live) and products from endangered species.</li>
              <li>Personal data, financial instruments, or government documents.</li>
              <li>Anything promoting hate, self-harm, or violence.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Listing quality standards</h2>
            </div>
            <Separator />
            <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <h3 className="font-medium text-foreground mb-2">Photos</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Use clear photos of the actual item you own (no stock photos).</li>
                  <li>Avoid watermarks, logos, or personal info in images.</li>
                  <li>Show any flaws or wear honestly.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Title & description</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Write accurate, concise titles; no emojis or ALL CAPS spam.</li>
                  <li>Describe condition, brand, model, and included accessories.</li>
                  <li>No external links, phone numbers, or solicitation.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Pricing and availability</h2>
            </div>
            <Separator />
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Set fair prices. If open to offers, include a price range.</li>
              <li>Don’t misrepresent retail value or condition.</li>
              <li>Post only items you currently own and can trade.</li>
              <li>No bait listings or placeholders intended to redirect users.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <HandCoins className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Duplicate and spam policy</h2>
            </div>
            <Separator />
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>No duplicate listings for the same item. Update your post instead.</li>
              <li>Don’t flood categories with low-quality or repetitive posts.</li>
              <li>Excessive off-platform promotion or solicitation is not allowed.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Enforcement and appeals</h2>
            </div>
            <Separator />
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Listings may be removed for rule violations without prior notice.</li>
              <li>Repeat violations can limit posting, messaging, or account access.</li>
              <li>If you believe a removal was in error, reply to the notice or contact support from your notifications.</li>
            </ul>
            <div className="pt-2">
              <Button asChild>
                <Link to="/post-item">Post an item</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </MainLayout>
  );
};

export default PostingRules;
