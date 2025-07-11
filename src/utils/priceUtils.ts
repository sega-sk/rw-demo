// Price formatting utilities with "Call for Price" support

export const formatPrice = (price: string | number | null | undefined): string => {
  // Handle null, undefined, or empty values
  if (price === null || price === undefined || price === '') {
    return 'Call for Price';
  }

  // Convert to number
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // Handle NaN or 0 values
  if (isNaN(numPrice) || numPrice === 0) {
    return 'Call for Price';
  }

  // Format as currency
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numPrice);
};

export const shouldShowCallForPrice = (price: string | number | null | undefined): boolean => {
  if (price === null || price === undefined || price === '') {
    return true;
  }
  
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return isNaN(numPrice) || numPrice === 0;
};

export const formatPriceWithSale = (
  retailPrice: string | number | null | undefined,
  salePrice?: string | number | null | undefined
): { 
  displayPrice: string;
  originalPrice?: string;
  isOnSale: boolean;
  isCallForPrice: boolean;
  shouldUseSmallFont?: boolean;
} => {
  const isRetailCallForPrice = shouldShowCallForPrice(retailPrice);
  const isSaleCallForPrice = shouldShowCallForPrice(salePrice);
  
  // If both are call for price or sale price exists and is call for price
  if (salePrice && !isSaleCallForPrice) {
    return {
      displayPrice: formatPrice(salePrice),
      originalPrice: isRetailCallForPrice ? undefined : formatPrice(retailPrice),
      isOnSale: true,
      isCallForPrice: false,
      shouldUseSmallFont: false
    };
  }
  
  // If retail price is call for price
  if (isRetailCallForPrice) {
    return {
      displayPrice: 'Call for Price',
      isOnSale: false,
      isCallForPrice: true,
      shouldUseSmallFont: true
    };
  }
  
  // Regular retail price
  return {
    displayPrice: formatPrice(retailPrice),
    isOnSale: false,
    isCallForPrice: false,
    shouldUseSmallFont: false
  };
};