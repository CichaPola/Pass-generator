<template>
  <div id="mainContainer">
    <b-button
      id="personalPasses"
      @click="goToPersonalPasses()"
      class="btn btn-light "
      >Przepustki osobowe</b-button
    >
    <Logout />
    <header
      id="title"
      :class="{ titleP: typeP, titleD: typeD, titleN: typeN, titleG: typeG }"
    >
      Przepustki samochodowe
    </header>
    <b-container id="passType">
      <p>Wybierz rodzaj przepustki:</p>
      
      <div class="radio-toolbar">
          <input id="P" value="P" type="radio" v-model="selectedType">
          <label id="PLabel" for="P">P</label>
          <input id="D" value="D" type="radio" v-model="selectedType">
          <label id="DLabel" for="D">D</label>
          <input id="N" value="N" type="radio" v-model="selectedType">
          <label id="NLabel" for="N">N</label>
          <input id="G" value="G" type="radio" v-model="selectedType">
          <label id="GLabel" for="G">G</label>
      </div>
    </b-container>
    <NDPForm
      v-if="
        selectedType === 'N' || selectedType === 'D' || selectedType === 'P'
      "
    />
    <GForm v-if="selectedType === 'G'" />
  </div>
</template>

<script>
import NDPForm from "../components/NDPForm.vue";
import GForm from "../components/GForm.vue";
import Logout from "../components/Logout.vue";

export default {
  components: {
    NDPForm,
    GForm,
    Logout
  },
  name: "CarPasses",
  data() {
    return {
      selectedType: "",
      options: [
        { text: "P", value: "P" },
        { text: "D", value: "D" },
        { text: "N", value: "N" },
        { text: "G", value: "G" }
      ]
    };
  },
  computed: {
    currentType() {
      return this.$store.getters.getCurrentType;
    },
    typeP() {
      if (this.currentType == "P") {
        return true;
      } else {
        return false;
      }
    },
    typeD() {
      if (this.currentType == "D") {
        return true;
      } else {
        return false;
      }
    },
    typeN() {
      if (this.currentType == "N") {
        return true;
      } else {
        return false;
      }
    },
    typeG() {
      if (this.currentType == "G") {
        return true;
      } else {
        return false;
      }
    }
  },
  created() {
    this.selectedType = this.currentType;
  },
  watch: {
    selectedType: function() {
      this.updateSelectedType();
    }
  },
  methods: {
    updateSelectedType() {
      this.$store.dispatch("updateSelectedType", this.selectedType);
    },
    goToPersonalPasses() {
      this.$router.replace({ name: "personalPasses" });
    }
  }
};
</script>

<style scoped>
@import '../style.css';

#passType {
  text-align: left;
  margin-left: 10%;
  margin-top: 20px;
  margin-bottom: 0%;
  padding: 0%;
}
.titleP {
  background: rgb(154, 87, 27);
  background: linear-gradient(
    274deg,
    rgba(154, 87, 27, 1) 0%,
    rgba(125, 24, 10, 0.8029586834733894) 0%,
    rgba(255, 223, 157, 1) 100%
  );
}
.titleD {
  background: rgb(2, 0, 36);
  background: linear-gradient(
    90deg,
    rgba(2, 0, 36, 1) 0%,
    rgba(255, 122, 122, 0.958420868347339) 0%,
    rgba(121, 9, 47, 1) 100%
  );
}
.titleN {
  background: rgb(2, 0, 36);
  background: linear-gradient(
    90deg,
    rgba(2, 0, 36, 1) 0%,
    rgba(99, 167, 247, 1) 0%,
    rgba(16, 27, 98, 1) 100%
  );
}
.titleG {
  background: rgb(2, 0, 36);
  background: linear-gradient(
    90deg,
    rgba(2, 0, 36, 1) 0%,
    rgba(137, 147, 200, 1) 0%,
    rgba(44, 85, 125, 1) 100%
  );
}
#personalPasses {
  position: absolute;
  right: 4%;
}
.radio-toolbar {
  margin-left: 0%;
}
.radio-toolbar input[type="radio"] {
  opacity: 0;
  position: fixed;
  width: 0;
}
.radio-toolbar label {
  display: inline-block;
  padding: 10px 20px;
  font-family: sans-serif, Arial;
  font-size: 16px;
  border: 2px solid #444;
  border-radius: 4px;
  margin-right: 5px;
}
.radio-toolbar input[type="radio"]:focus + label {
  border: 2px dashed #444;
}
#PLabel{
  background-color:  #ffd292;
}
#DLabel{
  background-color:  #ff7d79;
}
#NLabel {
  background-color:  #528fff;
}
#GLabel {
  background-color:  #7393ff;
}
#GLabel:hover {
  background-color:  #637fdb;
}
#PLabel:hover {
  background-color:  #dab47f;
}
#DLabel:hover{
  background-color:  #d46864;
}
#NLabel:hover{
  background-color:  #4578d6;
}
</style>
