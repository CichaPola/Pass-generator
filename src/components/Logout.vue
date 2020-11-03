<template>
    <div id="logout">
        <b-button @click="signOut()" class="btn btn-light ">Wyloguj</b-button>
    </div>
</template>

<script>
import * as firebase from "firebase/app";
import "firebase/auth";

export default {
    created(){
        firebase.auth().onAuthStateChanged(user => {
            if(user){
                this.loggedIn = true;
            } else {
                this.loggedIn = false;
            }
        })
    },
    data() {
        return {
            loggedIn: false
        }
    },
     methods: {
        async signOut(){
            try{
                const data = await firebase.auth().signOut();
                console.log(data);
                this.$router.replace({name: "login"})
            }catch(err){
                console.log(err);
            }
         }
     }
}
</script>

<style scoped>
#logout {
    position: absolute;
    top: 0%;
    right: 0%;
}
</style>