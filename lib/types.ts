/** Domain types shared by the data layer, the public site and the admin. */

export interface MediaRecord {
  readonly id: string;
  readonly url: string;
  readonly kind: 'upload' | 'bundled';
  readonly filename: string;
  readonly mime: string;
  readonly width: number;
  readonly height: number;
  readonly bytes: number;
  readonly blur: string;
  readonly created_at: string;
}

export interface PricingItem {
  readonly id: number;
  readonly name: string;
  readonly price: number;
  readonly currency: string;
  readonly period: string;
  readonly description: string;
  readonly sort_order: number;
  readonly active: number;
  readonly archived: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface Trainer {
  readonly id: number;
  readonly name: string;
  readonly role: string;
  readonly phone: string;
  readonly email: string;
  readonly bio: string;
  readonly image: string | null;
  readonly sort_order: number;
  readonly active: number;
  readonly archived: number;
  readonly created_at: string;
  readonly updated_at: string;
}

/** A trainer joined with its resolved portrait, ready to render. */
export interface TrainerView extends Trainer {
  readonly media: MediaRecord | null;
}

export interface GalleryItem {
  readonly id: number;
  readonly image: string;
  readonly title: string;
  readonly alt: string;
  readonly sort_order: number;
  readonly active: number;
  readonly archived: number;
  readonly created_at: string;
  readonly updated_at: string;
}

/** A gallery row joined with its media, ready to render. */
export interface GalleryView extends GalleryItem {
  readonly media: MediaRecord;
}

export interface Award {
  readonly id: number;
  readonly title: string;
  readonly year: string;
  readonly issuer: string;
  readonly description: string;
  readonly source_url: string;
  readonly sort_order: number;
  readonly active: number;
  readonly archived: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface LegalPage {
  readonly id: number;
  readonly slug: string;
  readonly title: string;
  readonly content: string;
  readonly sort_order: number;
  readonly active: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export type SiteSettings = Readonly<Record<string, string>>;
