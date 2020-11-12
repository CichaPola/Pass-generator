<template>
  <div id="mainContainer">
    <b-button id="carPasses" @click="goToCarPasses()" class="btn btn-light "
      >Przepustki samochodowe</b-button
    >
    <Logout />
    <header id="title">Przepustki osobowe</header>
    <b-form id="form" class="needs-validation" novalidate>
      <table>
        <tr>
          <td>
            <vue-typeahead-bootstrap
              v-model="pass.name"
              :data="nameData"
              :state="false"
              class="input"
              v-bind:class="[
                { valid: nameState },
                { invalid: nameState == false }
              ]"
              aria-invalid="true"
              placeholder="Imię: "
              required
            />
          </td>
          <td class="info">
            <p :class="{ colRed: nameCurrentLength > 20 }">
              {{ nameCurrentLength }}/20
            </p>
          </td>
        </tr>
        <td>
          <vue-typeahead-bootstrap
            :state="lastnameState"
            class="input"
            v-bind:class="[
              { valid: lastnameState },
              { invalid: lastnameState == false }
            ]"
            v-model="pass.lastname"
            :data="lastnameData"
            placeholder="Nazwisko: "
            required
          />
        </td>
        <td class="info">
          <p :class="{ colRed: lastnameCurrentLength > 20 }">
            {{ lastnameCurrentLength }}/20
          </p>
        </td>
        <tr>
          <td>
            <vue-typeahead-bootstrap
              :state="companyState"
              class="input"
              v-bind:class="[
                { valid: companyState },
                { invalid: companyState == false }
              ]"
              v-model="pass.company"
              :data="companyData"
              placeholder="Firma: "
              required
            />
          </td>
          <td class="info">
            <p :class="{ colRed: companyCurrentLength > 20 }">
              {{ companyCurrentLength }}/20
            </p>
          </td>
        </tr>
        <tr>
          <b-form-datepicker
            :state="validFromState"
            v-model="pass.validFrom"
            class="mb-2 input"
            placeholder="Ważne od"
            required
          ></b-form-datepicker>
        </tr>
        <tr>
          <b-form-datepicker
            :state="validToState"
            v-model="pass.validTo"
            class="mb-2 input"
            placeholder="Ważne do"
            required
          ></b-form-datepicker>
        </tr>
      </table>
    </b-form>

    <div id="buttons">
      <b-button @click="addPass()" id="addButton" variant="outline-primary"
        >Dodaj przepustkę</b-button
      >
      <b-button
        @click="deletePasses()"
        id="deleteButton"
        variant="outline-primary"
        >Usuń zaznaczone</b-button
      >
      <b-button @click="printPass()" id="printButton" variant="outline-primary"
        >Wygeneruj zaznaczone</b-button
      >
      <b-button @click="copyPass()" id="copyButton" variant="outline-primary"
        >Kopiuj zaznaczone</b-button
      >
    </div>

    <div id="list">
      <b-table
        ref="selectableTable"
        selectable
        :select-mode="selectMode"
        striped
        hover
        :items="passesArray"
        :bordered="true"
        :fields="fields"
        @row-selected="onRowSelected"
        responsive="sm"
      >
        <template v-slot:cell(selected)="{ rowSelected }">
          <template v-if="rowSelected">
            <span aria-hidden="true">&check;</span>
            <span class="sr-only">Selected</span>
          </template>
          <template v-else>
            <span aria-hidden="true">&nbsp;</span>
            <span class="sr-only">Not selected</span>
          </template>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script>
import Logout from "../components/Logout.vue";
import { BFormDatepicker } from "bootstrap-vue";
import * as firebase from "firebase/app";
require("firebase/database");
import { jsPDF } from "jspdf";
import { imgData } from "../imgData.js";
import { firaSans } from "../fonts/FiraSans.js";

export default {
  data() {
    return {
      nameState: null,
      lastnameState: null,
      companyState: null,
      validToState: null,
      validFromState: null,
      modes: ["multi", "single", "range"],
      selectMode: "range",
      selected: [],
      printed: [],
      fields: [
        {
          key: "selected",
          label: "Zaznaczone"
        },
        {
          key: "name",
          label: "Imię",
          sortable: true
        },
        {
          key: "lastname",
          label: "Nazwisko",
          sortable: true
        },
        {
          key: "company",
          label: "Firma",
          sortable: true
        },
        {
          key: "validFrom",
          label: "Ważne od"
        },
        {
          key: "validTo",
          label: "Ważne do"
        },
        {
          key: "printed",
          label: "Status",
          sortable: true
        }
      ],
      valid: true,
      pass: {
        name: "",
        lastname: "",
        validFrom: "",
        validTo: "",
        company: "",
        printed: "Nie wygenerowano"
      },
      passesArray: []
    };
  },
  components: {
    BFormDatepicker,
    Logout
  },
  async created() {
    await this.getPasses();
  },
  computed: {
    database() {
      return firebase.database();
    },
    rootRef() {
      return this.database.ref("/personal_passes");
    },
    passData() {
      let name = this.pass.name;
      let lastname = this.pass.lastname;
      let company = this.pass.company;

      name = name.toUpperCase()[0] + name.substring(1);
      lastname = lastname.toUpperCase()[0] + lastname.substring(1);
      company = company.toUpperCase()[0] + company.substring(1);

      let pass = {
        name: name,
        lastname: lastname,
        company: company
      };
      return pass;
    },
    nameData() {
      let data = [];
      for (let elem of this.passesArray) {
        data.push(elem.name);
      }
      return data;
    },
    lastnameData() {
      let data = [];
      for (let elem of this.passesArray) {
        data.push(elem.lastname);
      }
      return data;
    },
    companyData() {
      let data = [];
      for (let elem of this.passesArray) {
        data.push(elem.company);
      }
      return data;
    },
    nameCurrentLength() {
      return this.pass.name.length;
    },
    lastnameCurrentLength() {
      return this.pass.lastname.length;
    },
    companyCurrentLength() {
      return this.pass.company.length;
    }
  },
  methods: {
    async addPass() {
      await this.fillingValidation();
      await this.numOfCharValidation();
      if (this.valid == true) {
        this.pass.validFrom = this.formatDate(this.pass.validFrom);
        this.pass.validTo = this.formatDate(this.pass.validTo);

        const autoId = this.rootRef.push().key;
        this.rootRef.child(autoId).set({
          name: this.passData.name,
          lastname: this.passData.lastname,
          validFrom: this.pass.validFrom,
          validTo: this.pass.validTo,
          company: this.passData.company,
          printed: this.pass.printed,
          passKey: autoId
        });
        this.clearForm();
      } else {
        this.valid = true;
      }
      this.passesArray = [];
      this.getPasses();
    },
    async getPasses() {
      let app = this;
      await this.rootRef.orderByValue().on("value", function(snapshot) {
        snapshot.forEach(function(data) {
          app.passesArray.unshift(data.val());
        });
      });
    },
    formatDate(date) {
      return date
        .split("-")
        .reverse()
        .join(".");
    },
    clearForm() {
      this.pass.name = "";
      this.pass.lastname = "";
      this.pass.validFrom = "";
      this.pass.validTo = "";
      this.pass.company = "";
      this.resetStates();
    },
    resetStates() {
      this.nameState = null;
      this.lastnameState = null;
      this.companyState = null;
      this.validToState = null;
      this.validFromState = null;
    },
    onRowSelected(items) {
      this.selected = items;
    },
    deletePasses() {
      for (let pass of this.selected) {
        this.rootRef.child(pass.passKey).remove();
      }
      this.passesArray = [];
      this.getPasses();
    },
    sendSelectedPasses() {
      this.$store.dispatch("setPassesToPrint", this.selected);
    },
    updateStatus() {
      this.passesArray = [];
      let newData = {};
      let updates = {};
      for (let pass of this.selected) {
        newData = {
          printed: "Wygenerowano",
          name: pass.name,
          lastname: pass.lastname,
          validFrom: pass.validFrom,
          validTo: pass.validTo,
          company: pass.company,
          passKey: pass.passKey
        };
        updates["/personal_passes/" + pass.passKey] = newData;
        this.database.ref().update(updates);
      }
      this.passesArray = [];
      this.getPasses();
    },
    printPass() {
      if (this.selected.length == 0) {
        alert("Nie zaznaczono przepustek do wydruku!");
      } else {
        this.updateStatus();
        let doc = new jsPDF("p", "mm", [297, 210]);
        doc.addFileToVFS("../fonts/FiraSans-Bold.ttf", firaSans);
        doc.addFont("../fonts/FiraSans-Bold.ttf", "FiraSans-Bold", "Bold");
        let jpgHeight = 8;
        let nameHeight = 34;
        let lastNameHeight = 39;
        let companyHeight = 44;
        let validHeight = 28;
        let dateHeight = 33;
        let counter = 1;
        let size = 11;

        for (let elem of this.selected) {
          if (
            elem.name.length <= 14 ||
            elem.lastname.length <= 14 ||
            elem.company.length <= 14
          ) {
            size = 11;
          }
          if (
            elem.name.length >= 15 ||
            elem.lastname.length >= 15 ||
            elem.company.length >= 15
          ) {
            size = 9;
          }
          if (
            elem.name.length >= 17 ||
            elem.lastname.length >= 17 ||
            elem.company.length >= 17
          ) {
            size = 7.5;
          }

          if (counter == 1) {
            jpgHeight = 8;
            nameHeight = 34;
            lastNameHeight = 39;
            companyHeight = 44;
            validHeight = 28;
            dateHeight = 33;
          }
          if (counter == 2) {
            jpgHeight = 71;
            nameHeight = 97;
            lastNameHeight = 102;
            companyHeight = 107;
            validHeight = 91;
            dateHeight = 96;
          }
          if (counter == 3) {
            jpgHeight = 134;
            nameHeight = 160;
            lastNameHeight = 165;
            companyHeight = 170;
            validHeight = 152;
            dateHeight = 159;
          }
          if (counter == 4) {
            jpgHeight = 197;
            nameHeight = 223;
            lastNameHeight = 228;
            companyHeight = 233;
            validHeight = 215;
            dateHeight = 222;
          }
          doc.addImage(imgData, "JPEG", 8, jpgHeight, 174, 55);
          doc.setFont("FiraSans-Bold", "Bold");
          doc.setFontSize(size);
          doc.text(14, nameHeight, elem.name);
          doc.text(14, lastNameHeight, elem.lastname);
          doc.text(14, companyHeight, elem.company);
          doc.setFont("FiraSans-Bold", "Bold");
          doc.setFontSize(10);
          doc.text(126, validHeight, "Ważna w dniach");
          doc.text(119, dateHeight, `${elem.validFrom} – ${elem.validTo}`);

          if (counter == 4 && this.selected.length > 4) {
            doc.addPage();
            counter = 0;
          }
          counter++;
        }
        doc.save("document.pdf");
      }
    },
    fillingValidation() {
      if (this.pass.name == "") {
        this.valid = false;
        this.nameState = false;
      } else {
        this.nameState = true;
      }
      if (this.pass.lastname == "") {
        this.valid = false;
        this.lastnameState = false;
      } else {
        this.lastnameState = true;
      }
      if (this.pass.company == "") {
        this.valid = false;
        this.companyState = false;
      } else {
        this.companyState = true;
      }
      if (this.pass.validTo == "") {
        this.valid = false;
        this.validToState = false;
      } else {
        this.validToState = true;
      }
      if (this.pass.validFrom == "") {
        this.valid = false;
        this.validFromState = false;
      } else {
        this.validFromState = true;
      }
    },
    numOfCharValidation() {
      if (this.pass.name.length > 20) {
        this.valid = false;
        this.nameState = false;
        alert("Za duża ilość znaków!");
      }
      if (this.pass.lastname.length > 20) {
        this.valid = false;
        this.lastnameState = false;
        alert("Za duża ilość znaków!");
      }
      if (this.pass.company.length > 20) {
        this.valid = false;
        this.companyState = false;
        alert("Za duża ilość znaków!");
      }
    },
    copyPass() {
      if (this.selected.length > 1 || this.selected.length == 0) {
        alert("Prosze zaznaczyć jedną przepustkę!");
      } else {
        this.resetStates();
        this.pass.name = this.selected[0].name;
        this.pass.lastname = this.selected[0].lastname;
        this.pass.validFrom = this.selected[0].validFrom
          .split(".")
          .reverse()
          .join("-");
        this.pass.validTo = this.selected[0].validTo
          .split(".")
          .reverse()
          .join("-");
        this.pass.company = this.selected[0].company;
      }
    },
    goToCarPasses() {
      this.$router.replace({ name: "CarPasses" });
    }
  }
};
</script>

<style scoped>
@import "../style.css";

.input {
  width: 550px;
}
#form {
  width: 30%;
  margin-top: 5%;
  margin-left: 10%;
}
#title {
  background: rgb(2, 0, 36);
  background: linear-gradient(
    90deg,
    rgba(2, 0, 36, 1) 0%,
    rgba(61, 186, 212, 1) 0%,
    rgba(9, 30, 121, 1) 94%
  );
}
#buttons {
  margin-left: 10%;
  width: 717px;
  margin-top: 15px;
  margin-bottom: 15px;
}
#check {
  margin-left: 40px;
}
#list {
  width: 80% !important;
  margin-left: 10%;
  margin-bottom: 50px;
}
#carPasses {
  position: absolute;
  right: 4%;
}
.invalid {
  border: 1px solid red !important;
  border-radius: 0.25rem;
}
.valid {
  border: 1px solid #28a745 !important;
  border-radius: 0.25rem;
}
.info {
  font-size: 12px;
  margin: 0px;
  padding: 0px;
  color: #bbbecb;
  vertical-align: bottom;
  padding-left: 5px;
}
p {
  margin-bottom: 0px;
}
.colRed {
  color: red;
}
</style>
