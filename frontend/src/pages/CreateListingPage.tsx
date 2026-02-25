import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { catalogService } from '@services/catalog.service';
import { ImageUpload } from '@components/organisms/ImageUpload/ImageUpload';
import type { Category } from '@/types';

const CONDITIONS = [
  { value: 'new', label: 'Neuf' },
  { value: 'like_new', label: 'Comme neuf' },
  { value: 'very_good', label: 'Très bon état' },
  { value: 'good', label: 'Bon état' },
  { value: 'acceptable', label: 'Acceptable' },
] as const;

interface FormData {
  title: string;
  description?: string;
  price: number;
  condition: 'new' | 'like_new' | 'very_good' | 'good' | 'acceptable';
  categoryId: string;
}

export function CreateListingPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [imageError, setImageError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  useEffect(() => {
    catalogService.getCategories().then(setCategories).catch(() => {});
  }, []);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!imageUrl) {
      setImageError('Une image est requise');
      return;
    }
    setImageError('');
    setIsSubmitting(true);
    setSubmitError('');

    try {
      await catalogService.createProduct({ ...data, imageUrl });
      navigate('/catalog');
    } catch {
      setSubmitError('Erreur lors de la publication. Réessaie.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Publier une annonce</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Image */}
        <div>
          <div className="block text-sm font-medium text-gray-700 mb-2">
            Photo de l'article <span className="text-red-500">*</span>
          </div>
          <ImageUpload
            onUpload={(url) => { setImageUrl(url); setImageError(''); }}
            currentImageUrl={imageUrl || undefined}
          />
          {imageError && <p className="mt-1 text-sm text-red-600">{imageError}</p>}
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Titre <span className="text-red-500">*</span>
          </label>
          <input
            {...register('title', { required: 'Titre requis', minLength: { value: 3, message: 'Minimum 3 caractères' } })}
            id="title"
            type="text"
            placeholder="ex: Jordan 1 Retro High OG..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            {...register('description')}
            id="description"
            rows={4}
            placeholder="Décris ton article : état, taille, historique..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
        </div>

        {/* Category + Condition */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie <span className="text-red-500">*</span>
            </label>
            <select
              {...register('categoryId', { required: 'Catégorie requise' })}
              id="categoryId"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Choisir...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>}
          </div>

          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
              État <span className="text-red-500">*</span>
            </label>
            <select
              {...register('condition', { required: 'État requis' })}
              id="condition"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Choisir...</option>
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            {errors.condition && <p className="mt-1 text-sm text-red-600">{errors.condition.message}</p>}
          </div>
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Prix (€) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              {...register('price', { required: 'Prix requis', min: { value: 0.01, message: 'Le prix doit être positif' }, valueAsNumber: true })}
              id="price"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              className="w-full rounded-lg border border-gray-300 pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="absolute right-3 top-2 text-gray-400 text-sm">€</span>
          </div>
          {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
        </div>

        {submitError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {submitError}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Publication...' : 'Publier l\'annonce'}
          </button>
        </div>
      </form>
    </div>
  );
}
