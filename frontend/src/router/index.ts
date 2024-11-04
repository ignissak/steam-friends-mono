import { useUserStore } from '@/stores/user';
import { createRouter, createWebHistory } from 'vue-router';
import LoginHandlerVue from '../components/LoginHandler.vue';
import HomeView from '../views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginHandlerVue
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/Dashboard.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/new',
      name: 'new',
      component: () => import('../views/NewComparison.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/comparison/:id',
      name: 'comparison',
      component: () => import('../views/Comparison.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/signout',
      name: 'signout',
      component: () => import('../views/SignOut.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/404',
      component: () => import('../views/NotFound.vue')
    },
    {
      path: '/:catchAll(.*)',
      redirect: '/404'
    }
  ]
});

router.beforeEach((to, from, next) => {
  console.log(to.meta);
  if (to.meta.requiresAuth) {
    const userStore = useUserStore();
    if (userStore.isLoggedIn) {
      next();
    } else {
      userStore.signOut();
      next('/login');
    }
  } else {
    next();
  }
});

export default router;
