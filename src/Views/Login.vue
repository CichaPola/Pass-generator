<template>
    <div id="body">

        <nav class="navbar navbar-expand-lg navbar-light navbar-laravel">
            <div class="container">
                <p class="navbar-brand">Przepustki</p>
            </div>
        </nav>

        <main class="login-form">
            <div class="cotainer">
                <div class="row justify-content-center">
                    <div class="col-md-8">
                        <div class="card">
                            <div id="cardHeader" class="card-header">
                                <a id="headerTitle">Zaloguj się</a>
                            </div>
                            <div class="card-body">
                                <form @submit.prevent="pressed">
                                    <div class="form-group row">
                                        <label for="email_address" class="col-md-4 col-form-label text-md-right">Adres e-mail</label>
                                        <div class="col-md-6">
                                            <input v-model="email" type="email" id="email_address" class="form-control" name="email-address" required autofocus>
                                        </div>
                                    </div>

                                    <div class="form-group row">
                                        <label for="password" class="col-md-4 col-form-label text-md-right">Hasło</label>
                                        <div class="col-md-6">
                                            <input v-model="password" type="password" id="password" class="form-control" name="password" required>
                                        </div>
                                    </div>

                                    <div class="col-md-6 offset-md-4" id="loggingButton">
                                        <button type="submit" class="btn btn-primary">
                                            Zaloguj
                                        </button>
                                    </div>
                                </form>
                                <div class="error" v-if="error">{{error.message}}</div>    
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script>

import * as firebase from "firebase/app";
import "firebase/auth";

export default {
    data(){
        return{
            email: '',
            password: '',
            error: '',
        }
    },
    name: 'Login',
    methods: {
        async pressed() {
            try{
                const auth = await firebase.auth().signInWithEmailAndPassword(this.email,this.password);
                this.$router.replace({name: "choose"});
                auth
            } catch(err){
                console.log(err);
                alert("Niewłaściwy email lub hasło")
            }
        }
    },
}
</script>

<style scoped>
@import url(https://fonts.googleapis.com/css?family=Raleway:300,400,600);


#body{
    margin: 0;
    font-size: .9rem;
    font-weight: 400;
    line-height: 1.6;
    color: #212529;
    text-align: left;
    background-color: #f5f8fa;
    height: 100vh !important;
    width: 100vw !important;
    margin: 0px;
    position:fixed;
    top: 0px;
}
.container
{
    padding:0px;
    margin: 0px;
}
.navbar-laravel
{
    box-shadow: 0 2px 4px rgba(0,0,0,.04);
}
.navbar-brand , .nav-link, .my-form, .login-form
{
    font-family: Raleway, sans-serif;
    padding: 0px;;
}
.navbar-brand
{
    font-size: 30px;
    width: 100vw;
    margin-left: 17.5vw;
    padding-top: 10px;
}
.navbar
{
    padding: 0px;
}
.my-form
{
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
}

.my-form .row
{
    margin-left: 0;
    margin-right: 0;
}

.login-form
{
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
}

.login-form .row
{
    margin-left: 0;
    margin-right: 0;
}
#loggingButton{
    margin-top: 35px;
}
#headerTitle{
    margin-left: 10px;
}
#cardHeader
{
    padding: 0px;
    height: 3vh;
}
#link{
    color: white;
    text-decoration: none;
}
</style>