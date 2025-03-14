import { defineConfig } from '@umijs/max';
import {resolve} from 'path'
export default defineConfig({
  antd: {},
  access: {},
  request: {},
  monorepoRedirect: {
    srcDir: ['packages', 'src'],
  },
  // layout: {
  //   title: 'MOS v2',
  // },
  routes: [
    {
      path: '/',
      component: '@/layouts/basic',
      routes: [
        { path: '', component: 'viewer' },
      ],
    },
  ],
  alias: {
    "@utils": resolve(__dirname, 'src/utils'),
    "@helper": resolve(__dirname, 'src/helper'),
    "@molstar": resolve(__dirname, 'src/molstar'),
    "@components": resolve(__dirname, 'src/components'),
  },
  favicons: ['/favicon.ico'],
  npmClient: 'npm',
});
