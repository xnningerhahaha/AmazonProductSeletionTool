import { ProductInfo } from '../types';
import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface ProductBasicInfoProps {
  productInfo: ProductInfo;
}

export default function ProductBasicInfo({ productInfo }: ProductBasicInfoProps) {
  const { t } = useLanguage();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
        <div className="flex-shrink-0 mx-auto md:mx-0">
          <div className="relative w-40 sm:w-48 h-40 sm:h-48">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="animate-pulse text-gray-400 text-sm">{t.imageLoading}</div>
              </div>
            )}
            {imageError ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                <span className="text-gray-400 text-sm">{t.imageError}</span>
              </div>
            ) : (
              <img
                src={productInfo.imageUrl}
                alt={productInfo.title}
                className={`w-full h-full object-contain rounded-lg transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3 break-words">
            {productInfo.title}
          </h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-2xl sm:text-3xl font-bold text-blue-600">
                {productInfo.currency} {productInfo.price.toFixed(2)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <div className="flex items-center">
                <span className="text-yellow-500 text-base sm:text-lg mr-1">★</span>
                <span className="text-base sm:text-lg font-semibold text-gray-700">
                  {productInfo.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-sm sm:text-base text-gray-600">
                {productInfo.reviewCount.toLocaleString()} {t.reviews}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <span className="text-sm sm:text-base text-gray-600">{t.salesRank}:</span>
              <span className="text-sm sm:text-base font-semibold text-gray-800">
                #{productInfo.salesRank.toLocaleString()}
              </span>
              <span className="text-sm sm:text-base text-gray-500">{t.inCategory} {productInfo.category}</span>
            </div>
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <span className="text-sm sm:text-base text-gray-600">ASIN:</span>
              <span className="text-sm sm:text-base font-mono text-gray-800">{productInfo.asin}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
