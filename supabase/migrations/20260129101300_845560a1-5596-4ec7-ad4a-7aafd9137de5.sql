-- Create sponsored products table
CREATE TABLE public.sponsored_products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    external_url TEXT NOT NULL,
    category TEXT,
    daily_budget NUMERIC(10,2) NOT NULL DEFAULT 5.00,
    cost_per_click NUMERIC(10,4) NOT NULL DEFAULT 0.10,
    total_spent NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_clicks INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, paused
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clicks tracking table
CREATE TABLE public.sponsored_product_clicks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.sponsored_products(id) ON DELETE CASCADE,
    user_id UUID, -- nullable for anonymous users
    ip_hash TEXT, -- hashed IP for fraud prevention
    cost NUMERIC(10,4) NOT NULL,
    search_query TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sponsored_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsored_product_clicks ENABLE ROW LEVEL SECURITY;

-- Sponsored products policies
CREATE POLICY "Users can view their own sponsored products"
ON public.sponsored_products FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sponsored products"
ON public.sponsored_products FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sponsored products"
ON public.sponsored_products FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sponsored products"
ON public.sponsored_products FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Active approved products are viewable by everyone"
ON public.sponsored_products FOR SELECT
USING (is_active = true AND status = 'approved');

CREATE POLICY "Admins can view all sponsored products"
ON public.sponsored_products FOR SELECT
USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
    AND user_roles.is_active = true
));

CREATE POLICY "Admins can update all sponsored products"
ON public.sponsored_products FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
    AND user_roles.is_active = true
));

-- Click tracking policies
CREATE POLICY "System can insert clicks"
ON public.sponsored_product_clicks FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view clicks on their products"
ON public.sponsored_product_clicks FOR SELECT
USING (EXISTS (
    SELECT 1 FROM sponsored_products
    WHERE sponsored_products.id = product_id
    AND sponsored_products.user_id = auth.uid()
));

-- Create index for efficient querying
CREATE INDEX idx_sponsored_products_active ON public.sponsored_products(is_active, status);
CREATE INDEX idx_sponsored_products_category ON public.sponsored_products(category);
CREATE INDEX idx_sponsored_product_clicks_product ON public.sponsored_product_clicks(product_id);

-- Trigger for updated_at
CREATE TRIGGER update_sponsored_products_updated_at
BEFORE UPDATE ON public.sponsored_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();