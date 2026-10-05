import { put, del, list } from '@vercel/blob';
import path from 'path';
import fs from 'fs';
import type { MediaAssetItem, ProfileConfig } from '../src/types.ts';
import initialDbData from './db.json' with { type: 'json' };

export interface BrandSlots {
  heroCharacter?: string;
  aboutPhoto?: string;
  brandIcon?: string;
  brandBanner?: string;
}

export interface PersistentMediaRegistry {
  version: number;
  updatedAt: string;
  slots: BrandSlots;
  assets: MediaAssetItem[];
}

const REGISTRY_BLOB_PATH = 'metadata/media-registry.json';
const LOCAL_REGISTRY_PATH = path.join('/tmp', 'mk_media_registry.json');

export class PersistentMediaManager {
  private static registry: PersistentMediaRegistry | null = null;
  private static initPromise: Promise<PersistentMediaRegistry> | null = null;
  private static isInitialized = false;

  /**
   * Checks if server-side Vercel Blob access is available.
   * Uses BLOB_READ_WRITE_TOKEN from process.env.
   */
  public static isBlobConfigured(): boolean {
    return !!process.env.BLOB_READ_WRITE_TOKEN;
  }

  /**
   * Returns server-side Blob token if present.
   */
  public static getBlobToken(): string | undefined {
    return process.env.BLOB_READ_WRITE_TOKEN;
  }

  /**
   * Initializes the registry, loading state from Vercel Blob if available,
   * with fallback to disk cache or embedded initial database.
   */
  public static async ensureInitialized(): Promise<PersistentMediaRegistry> {
    if (this.isInitialized && this.registry) {
      return this.registry;
    }
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      // 1. Seed initial defaults from db.json
      const initialMedia = (initialDbData as { profile?: ProfileConfig; mediaAssets?: MediaAssetItem[] })?.profile?.media || {
        heroCharacter: '/assets/hero-character.svg',
        aboutPhoto: '/assets/about-manikantha.svg',
        brandIcon: '/assets/mk-logo.svg',
        brandBanner: '/assets/mk-forge-auto.svg',
      };

      const initialAssets: MediaAssetItem[] = (initialDbData as { mediaAssets?: MediaAssetItem[] })?.mediaAssets || [];

      let currentRegistry: PersistentMediaRegistry = {
        version: 1,
        updatedAt: new Date().toISOString(),
        slots: {
          heroCharacter: initialMedia.heroCharacter || '/assets/hero-character.svg',
          aboutPhoto: initialMedia.aboutPhoto || '/assets/about-manikantha.svg',
          brandIcon: initialMedia.brandIcon || '/assets/mk-logo.svg',
          brandBanner: initialMedia.brandBanner || '/assets/mk-forge-auto.svg',
        },
        assets: [...initialAssets],
      };

      // 2. Try loading from local disk cache if exists
      try {
        if (fs.existsSync(LOCAL_REGISTRY_PATH)) {
          const raw = fs.readFileSync(LOCAL_REGISTRY_PATH, 'utf-8');
          const parsed = JSON.parse(raw) as PersistentMediaRegistry;
          if (parsed && parsed.slots) {
            currentRegistry = {
              version: parsed.version || 1,
              updatedAt: parsed.updatedAt || new Date().toISOString(),
              slots: { ...currentRegistry.slots, ...parsed.slots },
              assets: Array.isArray(parsed.assets) && parsed.assets.length > 0 ? parsed.assets : currentRegistry.assets,
            };
          }
        }
      } catch (err) {
        console.warn('[PersistentMedia] Error reading local disk registry:', err);
      }

      // 3. If Vercel Blob is configured, fetch authoritative registry from Blob
      if (this.isBlobConfigured()) {
        try {
          const token = this.getBlobToken();
          const listRes = await list({
            prefix: REGISTRY_BLOB_PATH,
            token,
          });

          const blobMatch = listRes.blobs.find((b) => b.pathname === REGISTRY_BLOB_PATH);
          if (blobMatch?.url) {
            const resp = await fetch(blobMatch.url, { cache: 'no-store' });
            if (resp.ok) {
              const remoteRegistry = (await resp.json()) as PersistentMediaRegistry;
              if (remoteRegistry && remoteRegistry.slots) {
                currentRegistry = {
                  version: remoteRegistry.version || 1,
                  updatedAt: remoteRegistry.updatedAt || new Date().toISOString(),
                  slots: {
                    heroCharacter: remoteRegistry.slots.heroCharacter || currentRegistry.slots.heroCharacter,
                    aboutPhoto: remoteRegistry.slots.aboutPhoto || currentRegistry.slots.aboutPhoto,
                    brandIcon: remoteRegistry.slots.brandIcon || currentRegistry.slots.brandIcon,
                    brandBanner: remoteRegistry.slots.brandBanner || currentRegistry.slots.brandBanner,
                  },
                  assets: Array.isArray(remoteRegistry.assets) ? remoteRegistry.assets : currentRegistry.assets,
                };
                // Sync back to local disk cache
                this.writeLocalCache(currentRegistry);
              }
            }
          }
        } catch (err) {
          console.warn('[PersistentMedia] Error fetching registry from Vercel Blob:', err);
        }
      }

      this.registry = currentRegistry;
      this.isInitialized = true;
      this.initPromise = null;
      return currentRegistry;
    })();

    return this.initPromise;
  }

  /**
   * Synchronously writes to /tmp cache.
   */
  private static writeLocalCache(registry: PersistentMediaRegistry): void {
    try {
      fs.writeFileSync(LOCAL_REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');
    } catch {
      // ignore read-only /tmp errors
    }
  }

  /**
   * Persists the current in-memory registry to Vercel Blob (and local cache).
   */
  public static async persistRegistry(): Promise<void> {
    if (!this.registry) return;

    this.registry.updatedAt = new Date().toISOString();
    this.writeLocalCache(this.registry);

    if (this.isBlobConfigured()) {
      try {
        const token = this.getBlobToken();
        const jsonBuffer = Buffer.from(JSON.stringify(this.registry, null, 2), 'utf-8');
        await put(REGISTRY_BLOB_PATH, jsonBuffer, {
          access: 'public',
          contentType: 'application/json',
          addRandomSuffix: false,
          allowOverwrite: true,
          token,
        });
      } catch (err) {
        console.error('[PersistentMedia] Failed to persist registry to Vercel Blob:', err);
      }
    }
  }

  /**
   * Uploads an image buffer to Vercel Blob using put().
   * Returns the permanent public blob.url.
   */
  public static async uploadFile(
    filename: string,
    buffer: Buffer,
    contentType: string
  ): Promise<{ url: string; pathname: string; size: number }> {
    const token = this.getBlobToken();
    if (!token) {
      throw new Error('BLOB_READ_WRITE_TOKEN is not configured.');
    }

    const blobPath = `uploads/${filename}`;
    const blob = await put(blobPath, buffer, {
      access: 'public',
      contentType: contentType || 'application/octet-stream',
      addRandomSuffix: false,
      allowOverwrite: true,
      token,
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
      size: buffer.length,
    };
  }

  /**
   * Deletes a blob if stored on Vercel Blob.
   */
  public static async deleteFile(urlOrPathname: string): Promise<boolean> {
    if (!this.isBlobConfigured() || !urlOrPathname) return false;
    try {
      const token = this.getBlobToken();
      await del(urlOrPathname, { token });
      return true;
    } catch (err) {
      console.warn('[PersistentMedia] Error deleting blob:', err);
      return false;
    }
  }

  /**
   * Returns current 4 brand identity slots.
   */
  public static getSlots(): BrandSlots {
    if (!this.registry) {
      // Fallback if accessed before async initialization
      const initialMedia = (initialDbData as { profile?: ProfileConfig })?.profile?.media as BrandSlots | undefined;
      return {
        heroCharacter: initialMedia?.heroCharacter || '/assets/hero-character.svg',
        aboutPhoto: initialMedia?.aboutPhoto || '/assets/about-manikantha.svg',
        brandIcon: initialMedia?.brandIcon || '/assets/mk-logo.svg',
        brandBanner: initialMedia?.brandBanner || '/assets/mk-forge-auto.svg',
      };
    }
    return { ...this.registry.slots };
  }

  /**
   * Sets ONLY a single slot, ensuring strict isolation between the 4 slots.
   */
  public static async setSlot(
    slotKey: keyof BrandSlots,
    url: string
  ): Promise<BrandSlots> {
    await this.ensureInitialized();
    if (!this.registry) {
      throw new Error('PersistentMediaManager failed to initialize');
    }

    // Update ONLY the specified slot, preserving the other three slots
    this.registry.slots = {
      ...this.registry.slots,
      [slotKey]: url,
    };

    await this.persistRegistry();
    return { ...this.registry.slots };
  }

  /**
   * Returns all media assets.
   */
  public static getAssets(): MediaAssetItem[] {
    if (!this.registry) {
      return (initialDbData as { mediaAssets?: MediaAssetItem[] })?.mediaAssets || [];
    }
    return [...this.registry.assets].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Adds or updates a media asset item in persistent registry.
   */
  public static async addAsset(asset: MediaAssetItem): Promise<MediaAssetItem> {
    await this.ensureInitialized();
    if (!this.registry) {
      throw new Error('PersistentMediaManager failed to initialize');
    }

    const assets = [...this.registry.assets];
    const existingIdx = assets.findIndex((a) => a.filename === asset.filename);
    if (existingIdx >= 0) {
      assets[existingIdx] = { ...assets[existingIdx], ...asset };
    } else {
      assets.unshift(asset);
    }

    this.registry.assets = assets;
    await this.persistRegistry();
    return asset;
  }

  /**
   * Updates an existing media asset item.
   */
  public static async updateAsset(
    filename: string,
    updates: Partial<MediaAssetItem>
  ): Promise<MediaAssetItem | null> {
    await this.ensureInitialized();
    if (!this.registry) return null;

    const assets = [...this.registry.assets];
    const idx = assets.findIndex((a) => a.filename === filename);
    if (idx === -1) return null;

    assets[idx] = {
      ...assets[idx],
      ...updates,
      usage: updates.usage !== undefined ? updates.usage : assets[idx].usage,
      panelConfig: updates.panelConfig !== undefined ? updates.panelConfig : assets[idx].panelConfig,
    };

    this.registry.assets = assets;
    await this.persistRegistry();
    return assets[idx];
  }

  /**
   * Deletes an asset by filename from persistent registry and Blob store.
   */
  public static async deleteAsset(filename: string): Promise<boolean> {
    await this.ensureInitialized();
    if (!this.registry) return false;

    const targetAsset = this.registry.assets.find((a) => a.filename === filename);
    if (targetAsset && targetAsset.url && targetAsset.url.startsWith('http')) {
      await this.deleteFile(targetAsset.url);
    }

    const initLen = this.registry.assets.length;
    this.registry.assets = this.registry.assets.filter((a) => a.filename !== filename);
    if (this.registry.assets.length !== initLen) {
      await this.persistRegistry();
      return true;
    }
    return false;
  }

  /**
   * Merges persistent brand slots into a ProfileConfig object.
   */
  public static syncWithProfile(profile: ProfileConfig): ProfileConfig {
    const slots = this.getSlots();
    const media = profile.media || {};

    return {
      ...profile,
      media: {
        heroCharacter: slots.heroCharacter || media.heroCharacter || '/assets/hero-character.svg',
        aboutPhoto: slots.aboutPhoto || media.aboutPhoto || '/assets/about-manikantha.svg',
        brandIcon: slots.brandIcon || media.brandIcon || '/assets/mk-logo.svg',
        brandBanner: slots.brandBanner || media.brandBanner || '/assets/mk-forge-auto.svg',
      },
    };
  }
}
