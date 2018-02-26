import Vue from 'vue'
import Router from 'vue-router'
import {Title, RouterConfig} from 'src/web.config'
Vue.use(Router)
const router = new Router({
  routes: RouterConfig,
  linkActiveClass: 'active'
})
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || Title
  next()
})
window.Router = router

export default router
