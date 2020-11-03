import Login from './Views/Login.vue';
import Choose from './Views/Choose.vue';
import PersonalPasses from './Views/PersonalPasses.vue';
import CarPasses from './Views/CarPasses.vue';
import "firebase/auth";

const routes = [
    {path: '/', component: Login, name: 'login'},
    {path: '/wybor-przepustki', component: Choose, name: 'choose', meta: {requiresAuth: true}},
    {path: '/przepustki-osobowe', component: PersonalPasses, name: 'personalPasses', meta: {requiresAuth: true}},
    {path: '/przepustki-samochodowe', component: CarPasses, name: 'CarPasses', meta: {requiresAuth: true}},
];

export default routes;