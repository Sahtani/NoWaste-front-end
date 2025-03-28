import {environment} from '../../../environments/environment';


export function getImageUrl(imagePath: string | undefined): string {
  if (!imagePath) {
    return '';
  }

  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  if (imagePath.startsWith('/api/')) {
    const path = imagePath.startsWith('/api/') ? imagePath.substring(4) : imagePath;
    return `${environment.apiUrlDash}${path}`;
  }

  return `${environment.apiUrlDash}${imagePath}`;
}
