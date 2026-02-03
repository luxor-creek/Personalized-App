-- Add portfolio videos and custom section image fields
ALTER TABLE public.landing_page_templates
ADD COLUMN IF NOT EXISTS portfolio_videos jsonb DEFAULT '[
  {"title": "Product overview", "image": "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=250&fit=crop"},
  {"title": "Brand story", "image": "https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=250&fit=crop"},
  {"title": "Event/trade show", "image": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=250&fit=crop"}
]'::jsonb;

ALTER TABLE public.landing_page_templates
ADD COLUMN IF NOT EXISTS custom_section_image_url text DEFAULT 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop';