import { Pipe, PipeTransform, inject } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { BaseHrefService } from '@core/services/base-href.service';

@Pipe({ name: 'assetUrl' })
export class AssetUrlPipe implements PipeTransform {
  private baseHref = inject(BaseHrefService);

  transform(value: string): string {
    if (!value) return '';
    const cleanPath = value.startsWith('/') ? value.substring(1) : value;
    return `${this.baseHref.getBaseHref()}${cleanPath}`;
  }
}
