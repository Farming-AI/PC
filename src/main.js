// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
/*
import Vue from 'vue'
import ElementUI from 'element-ui'
import router from 'src/router/index'
import './assets/css/reset.css'
import './assets/css/font/iconfont.css'
import 'element-ui/lib/theme-chalk/index.css'
Vue.config.productionTip = false
Vue.use(ElementUI)
*/
import Vue from 'vue'
import router from 'src/router/index'
import MuseUI from 'muse-ui'
import ElementUI from 'element-ui'
import './assets/css/reset.css'
import './assets/css/font/iconfont.css'
import 'element-ui/lib/theme-chalk/index.css'
import 'muse-ui/dist/muse-ui.css'
Vue.config.productionTip = false

Vue.use(ElementUI)
Vue.use(MuseUI)
window.Vue = Vue
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  diagol: {}
})
