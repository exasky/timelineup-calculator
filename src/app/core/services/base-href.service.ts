import { DOCUMENT, inject, Service } from "@angular/core";

@Service()
export class BaseHrefService {
  private document = inject(DOCUMENT);

  getBaseHref(): string {
    const baseElement = this.document.querySelector('base');
    const baseHref = baseElement ? baseElement.getAttribute('href') || '/' : '/';
    return baseHref
  }
}
