import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store ({
    state: {
        currentPassType: "P",
    },
    getters: {
        getCurrentType(state) {
            return state.currentPassType;
        },
    },
    mutations: {
        setNewType(state, payload) {
            state.currentPassType=payload;
        },
    },
    actions: {
        updateSelectedType({commit}, selectedType) {
            commit('setNewType', selectedType);
        },
    }
});