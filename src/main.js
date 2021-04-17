import Vue from 'vue'
import Vant from "vant";
import App from './App.vue'
import router from './router'
import store from './store'


Vue.config.productionTip = false
import "amfe-flexible";
import "vant/lib/index.css";
import "assets/font/iconfont.css";

Vue.use(Vant);

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')