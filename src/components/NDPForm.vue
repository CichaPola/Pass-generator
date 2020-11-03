<template>
    <div>
        <div id="form">
            
            <b-form-input :class="{ inputP : typeP, inputD : typeD, inputN : typeN }" :state="idNumberState" class="input" v-model="pass.idNumber" placeholder="Numer identyfikacyjny: "></b-form-input>
            
            <b-form-input :class="{ inputP : typeP, inputD : typeD, inputN : typeN }" :state="carRegState" class="input" v-model="pass.carRegistrationNumber" placeholder="Numer rejestracyjny pojazdu: "></b-form-input>
            
            <b-form-input :class="{ inputP : typeP, inputD : typeD, inputN : typeN }" :state="phoneNumState" class="input" v-model="pass.phoneNumber" placeholder="Telefon służbowy:"></b-form-input>

            <div id="buttons">
                <b-button :class="{ btn2P : typeP, btn2D : typeD, btn2N : typeN }" @click="addPass()" id="addButton">Dodaj przepustkę</b-button>
                <b-button :class="{ btn2P : typeP, btn2D : typeD, btn2N : typeN }" @click="deletePasses()" id="deleteButton" >Usuń zaznaczone</b-button>
                <b-button :class="{ btn2P : typeP, btn2D : typeD, btn2N : typeN }" @click="print()" id="printButton">Wygeneruj zaznaczone</b-button>
            </div>

        </div>
        <div id="list">
            <b-table 
            responsive
            ref="selectableTable"
            selectable
            :select-mode="selectMode" 
            striped hover 
            :items="passesArray" 
            :bordered="true"
            :fields="fields"
            @row-selected="onRowSelected"
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
import * as firebase from "firebase/app";
require('firebase/database');
import { jsPDF } from "jspdf";

export default {
    data() {
        return {
            passType: "P",
            pass: {
                idNumber:'',
                carRegistrationNumber:'',
                phoneNumber:'',
                printed: 'Nie wygenerowano',
                type: '',
            },
            deleted: true,
            added: true,
            idNumberState: null,
            phoneNumState: null,
            carRegState: null,
            valid: true,
            modes: ['multi', 'single', 'range'],
            selectMode: 'range',
            selected: [],
            passesArray: [],
            fields: [
                {
                key: 'selected',
                label: 'Zaznaczone',
                }, 
                {
                key: 'idNumber',
                label: 'Numer Identyfikacyjny',
                sortable:true
                }, 
                {
                key: 'carRegistrationNumber',
                label: 'Numer rejestracyjny pojazdu',
                sortable:true
                }, 
                {
                key: 'phoneNumber',
                label: 'Telefon służbowy',
                sortable:true
                },
                {
                key: 'printed',
                label: 'Status',
                sortable:true
                }, 
            ],
        }    
    },
    async created(){
        await this.getPasses();
    },
    computed: {
        currentType(){
            return this.$store.getters.getCurrentType;
        },
        database(){
            return firebase.database();
        },
        rootRef(){
            return this.database.ref('/car_passes')
        },
        typeP() {
            if(this.currentType=="P") {
                return true
            }
            else {
                return false
            }
        },
        typeD() {
            if(this.currentType=="D") {
                return true
            }
            else {
                return false
            }
        },
        typeN() {
            if(this.currentType=="N") {
                return true
            }
            else {
                return false
            }
        }
    },
    methods: {
        print() {
            if(this.selected.length==0) {
                alert("Nie zaznaczono przepustek do wydruku!")
            }
            else {
                this.updateStatus();
                const doc = new jsPDF('l', 'mm', [145,95]);
                let counter=1;
                for( let elem of this.selected){
                    doc.setFont("Times New Roman","bold");
                    doc.setFontSize(18);
                    doc.text(41,32, elem.idNumber);
                    doc.setFontSize(32);
                    doc.text(22,54, elem.carRegistrationNumber);
                    doc.setFontSize(18);
                    doc.text(25,73, elem.phoneNumber);
                    doc.text(18,86, "----------");
                    if(counter<this.selected.length){
                       doc.addPage(); 
                    }
                    counter++
                }
                doc.save('document.pdf');
            }
        },
        updateStatus(){
            let newData = {};
            let updates = {};
            for(let pass of this.selected) {
            newData= {
              printed: "Wygenerowano",
              idNumber: pass.idNumber,
              carRegistrationNumber: pass.carRegistrationNumber,
              phoneNumber: pass.phoneNumber,
              passKey: pass.passKey,
              type: pass.type,
            }
            updates['/car_passes/' + pass.passKey] = newData;
            this.database.ref().update(updates)    
          }
            this.passesArray=[];
            this.getPasses();
        },
        validation(){
            if(this.pass.idNumber=="") {
                this.valid=false;
                this.idNumberState=false;
            }
            else {
                this.idNumberState=true;
            }
            if(this.pass.carRegistrationNumber=="") {
                this.valid=false;
                this.carRegState=false;
            }
            else {
                this.carRegState=true;
            }
            if(this.pass.phoneNumber=="") {
                this.valid=false;
                this.phoneNumState=false;
            }
            else {
                this.phoneNumState=true;
            }
        },
        onRowSelected(items) {
            this.selected = items
        },
        deletePasses(){
            for(let pass of this.selected){
                this.passesArray=[];
                this.rootRef.child(pass.passKey).remove()
            }
            this.passesArray=[];
            this.getPasses();
        },
        getCurrentType(){
            this.passType = this.currentType;
        },
        async getPasses(){
            let app = this;
            this.passesArray=[];
            await this.rootRef.orderByChild('type').equalTo(app.currentType).on('value', function(snapshot) {
                snapshot.forEach(function(data) {
                    app.passesArray.unshift(data.val());
                });            
            });
        },
        async addPass() {
            await this.validation();
            if(this.valid==true){
                this.passesArray=[];
                this.pass.type=this.passType;
                //this.$store.dispatch('addNewPass', this.pass);        
                
                const autoId = this.rootRef.push().key
                this.rootRef.child(autoId).set({
                    idNumber: this.pass.idNumber,
                    carRegistrationNumber: this.pass.carRegistrationNumber,
                    phoneNumber: this.pass.phoneNumber,
                    printed: this.pass.printed,
                    type: this.pass.type,
                    passKey: autoId,
               })
               this.$store.dispatch('addPass', this.added);
               this.clearForm();
               this.passesArray=[];
               this.getPasses();
               this.idNumberState= null;
                this.phoneNumState= null;
                this.carRegState= null;
            }
            else{
                this.valid=true;
            }
        },
        clearForm(){
            this.pass.idNumber="";
            this.pass.carRegistrationNumber="";
            this.pass.phoneNumber="";
        },
    },
    watch: {
        currentType: function() {
            this.getCurrentType();
            this.getPasses();
            this.idNumberState= null;
            this.phoneNumState= null;
            this.carRegState= null;
        },
    }
}
</script>

<style scoped>

.input, .invalid-feedback {
  margin-top: 20px;
  text-align: left;
}
.input {
    width: 550px;
}
.invalid-feedback {
  margin-top: 0%;
  margin-bottom: 0%;
}
#form {
  margin-left: 10%;
}
#addButton, #deleteButton, #printButton {
  margin-right: 15px;
}
#buttons {
  width: 541px;
  margin-top: 20px;
  margin-bottom: 20px;
}
#check{
  margin-left: 40px;
}
#list {
    width: 80% !important;
    margin-left: 10%;
    margin-bottom: 50px;
}
.inputP:focus{
    box-shadow: 0 0 0 0.2rem rgba(212, 178, 134, 0.692) !important;
}
.inputD:focus {
    box-shadow: 0 0 0 0.2rem rgba(201, 130, 128, 0.692) !important;
}
.inputN:focus {
    box-shadow: 0 0 0 0.2rem rgba(143, 154, 218, 0.692) !important;
}
.btn2P {
    background-color: transparent;
    border: 1px solid #E7B269;
    color: #E7B269;
}
.btn2P:hover {
    background-color: #E7B269;
    border: 1px solid #E7B269;
}
.btn2D {
    background-color: transparent;
    border: 1px solid #e76d69;
    color: #e76d69;
}
.btn2D:hover {
    background-color:  #e76d69;
    border: 1px solid  #e76d69;
}
.btn2N {
    background-color: transparent;
    border: 1px solid #3f72d1;
    color: #3f72d1;
}
.btn2N:hover {
    background-color:  #3f72d1;
    border: 1px solid  #3f72d1;
}
</style>