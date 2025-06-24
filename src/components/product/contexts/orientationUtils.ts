
export const getAspectRatio = (orientation: string): string => {
  switch (orientation) {
    case 'vertical':
      return '2:3';
    case 'horizontal':
      return '3:2';
    case 'square':
    default:
      return '1:1';
  }
};
