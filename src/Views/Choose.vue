<template>
  <div id="mainContainer">
    <Logout />
    <h2 id="title">Wybierz rodzaj przepustki:</h2>

    <router-link to="przepustki-osobowe">
      <div id="personal">
        <img src="../assets/people.png" />
        <p>
          Przepustki <br />
          osobowe
        </p>
      </div>
    </router-link>
    <router-link to="przepustki-samochodowe">
      <div id="car">
        <img src="../assets/car.png" />
        <p>
          Przepustki <br />
          samochodowe
        </p>
      </div>
    </router-link>
  </div>
</template>

<script>
import Logout from "../components/Logout.vue";

export default {
  name: "Choose",
  components: { Logout: Logout }
};
</script>

<style scoped>
@import "../style.css";

h2 {
  background: linear-gradient(
    90deg,
    rgba(2, 0, 36, 1) 0%,
    rgba(61, 186, 212, 1) 0%,
    rgba(9, 30, 121, 1) 94%
  );
  margin-bottom: 0px;
}
#car,
#personal {
  width: 50%;
  float: left;
  height: 79.8%;
  padding-top: 230px;
  font-family: "Montserrat", sans-serif;
}
#car:hover,
#personal:hover {
  background-color: #d3d8e3;
}
p {
  color: black;
  font-size: 20px;
  font-weight: bold;
}
img {
  width: 20%;
  margin-bottom: 35px;
}
@media only screen and (min-width: 600px) {
  p {
    font-size: 30px;
  }
}
</style>
