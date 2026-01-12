// @ts-check
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import starlightTypeDoc, { typeDocSidebarGroup } from 'starlight-typedoc';

// https://astro.build/config
export default defineConfig({
  site: 'https://ash-r1.github.io/noto-pdf-ts',
  base: '/noto-pdf-ts',
  integrations: [
    starlight({
      title: 'noto-pdf-ts',
      description: 'PDF conversion library for Node.js',
      social: {
        github: 'https://github.com/ash-r1/noto-pdf-ts',
      },
      editLink: {
        baseUrl: 'https://github.com/ash-r1/noto-pdf-ts/edit/main/website/',
      },
      defaultLocale: 'root',
      locales: {
        root: {
          label: 'English',
          lang: 'en',
        },
        ja: {
          label: '日本語',
          lang: 'ja',
        },
      },
      sidebar: [
        {
          label: 'Getting Started',
          translations: { ja: 'はじめに' },
          items: [
            { slug: 'getting-started/introduction' },
            { slug: 'getting-started/quick-start' },
          ],
        },
        {
          label: 'Guides',
          translations: { ja: 'ガイド' },
          autogenerate: { directory: 'guides' },
        },
        typeDocSidebarGroup,
      ],
      plugins: [
        starlightTypeDoc({
          entryPoints: ['../src/index.ts'],
          tsconfig: '../tsconfig.json',
          typeDoc: {
            excludePrivate: true,
            excludeInternal: true,
            skipErrorChecking: true,
          },
        }),
      ],
      customCss: ['./src/styles/custom.css'],
    }),
  ],
});
