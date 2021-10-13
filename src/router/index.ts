import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import Tabs from '../views/Tabs.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/view/active'
  },
  {
    path: '/view/',
    component: Tabs,
    children: [
      {
        path: 'active',
        component: () => import('@/views/ActiveView.vue')
      },
      {
        path: 'planing',
        component: () => import('@/views/PlaningView.vue')
      },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
