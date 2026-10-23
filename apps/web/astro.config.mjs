import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
export default defineConfig({ output: 'static', integrations: [react(), mdx()], site: process.env.PUBLIC_SITE_URL || 'http://localhost:4321' });
