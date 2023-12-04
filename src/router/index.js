import { createRouter, createWebHistory } from 'vue-router'
import DaysView from '../views/DaysView.vue'


const routes = [
  {
    path: '/day/:date',
    name: 'DaysView',
    component: DaysView,
    props: route => ({ date: route.params.date })
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/') {
    next(`/day/${new Date().toISOString().split('T')[0]}`);
  } else if (to.path.startsWith('/day/')) {
    next();
  } else {
    next('/');
  }
});

export default router
