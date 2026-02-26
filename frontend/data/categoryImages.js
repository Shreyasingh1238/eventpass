export const CATEGORY_IMAGES = {
  Dance:
    'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&w=1200&q=80',
  AI:
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
  Singing:
    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80',
  Concert:
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80',
  'Fashion Show':
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80'
}

export const getCategoryImage = (category) =>
  CATEGORY_IMAGES[category] ||
  'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1200&q=80'
