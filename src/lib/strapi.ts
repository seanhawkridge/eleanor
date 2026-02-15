const STRAPI_URL = import.meta.env.STRAPI_URL || 'http://localhost:1337';

interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface StrapiItem<T> {
  id: number;
  documentId: string;
  attributes: T;
}

export async function fetchAPI<T>(
  path: string,
  params: Record<string, string> = {},
): Promise<StrapiResponse<T>> {
  const url = new URL(`/api${path}`, STRAPI_URL);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Strapi error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export interface StrapiProject {
  title: string;
  description: string;
  image?: { url: string } | null;
  tags: string[] | null;
  date: string;
  url?: string | null;
  slug: string;
  body: any;
}

export interface StrapiHomepage {
  heading: string;
  intro: string;
}

export async function getProjects(limit?: number) {
  const params: Record<string, string> = {
    'sort': 'date:desc',
    'populate': '*',
    'status': 'published',
  };
  if (limit) {
    params['pagination[limit]'] = String(limit);
  }
  const { data } = await fetchAPI<StrapiProject[]>('/projects', params);
  return data;
}

export async function getProjectBySlug(slug: string) {
  const { data } = await fetchAPI<StrapiProject[]>('/projects', {
    'filters[slug][$eq]': slug,
    'populate': '*',
    'status': 'published',
  });
  return data[0] ?? null;
}

export async function getHomepage() {
  const { data } = await fetchAPI<StrapiHomepage>('/homepage', {
    'status': 'published',
  });
  return data;
}

export function getStrapiImageUrl(image: { url: string } | null | undefined): string | undefined {
  if (!image?.url) return undefined;
  // If the URL is already absolute, return as-is
  if (image.url.startsWith('http')) return image.url;
  // Otherwise prepend the Strapi base URL
  return `${STRAPI_URL}${image.url}`;
}
