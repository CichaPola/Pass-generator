import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router';
import routes from './routes';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import './custom.scss'
import firebase from "firebase/app";
import store from "./store";
import VueTypeaheadBootstrap from 'vue-typeahead-bootstrap';

Vue.component('vue-typeahead-bootstrap', VueTypeaheadBootstrap)

const firebaseConfig = {
  apiKey: "AIzaSyB1Cc0ZYs3keBro3ozhbM78NTS7MQdkao8",
  authDomain: "passes-public.firebaseapp.com",
  databaseURL: "https://passes-public.firebaseio.com",
  projectId: "passes-public",
  storageBucket: "passes-public.appspot.com",
  messagingSenderId: "641434668763",
  appId: "1:641434668763:web:b8525df4233d9d29e486fe"
};

firebase.initializeApp(firebaseConfig);

Vue.use(BootstrapVue, IconsPlugin)
Vue.config.productionTip = false

Vue.use(VueRouter);

const router = new VueRouter({
  routes,
  mode: 'history'
});

router.beforeEach((to, from, next)=>{
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = firebase.auth().currentUser;
  if(requiresAuth && !isAuthenticated){
      next("/");
  }else{
      next();
  }
})

let app;
firebase.auth().onAuthStateChanged(user => {
  user
  if (!app) {
    app = new Vue({
      router,
      store,
      render: h => h(App)
    }).$mount("#app");
  }
});