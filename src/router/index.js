import { createRouter, createWebHistory } from '@ionic/vue-router';
import AppPage from '../App.vue'

const routes = [
  {
    path: '/',
    component: AppPage,
    children: [
      {
        path: '',
        component: () => import('@/views/LoginPage.vue')
      },
      {
        path: 'main',
        component: () => import('@/views/MainPage.vue')
      },
      {
        path: 'settings',
        component: () =>import('@/views/SettingsPage.vue')
      },
      {
        path: 'login',
        component: () => import('@/views/LoginPage.vue')
      },
      {
        path: 'register',
        component: () => import('@/views/RegisterPage.vue')
      },
      {
        path: 'ridelist',
        component: () => import('@/views/RideListPage.vue')
      },
      {
        path:'myrides',
        component: () => import('@/views/MyRidesPage.vue')
      },
      {
        path:'balance',
        component: () => import('@/views/BalancePage.vue')
      },
      {
        path:'support',
        component: () =>import('@/views/SupportPage.vue')
      } 
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
