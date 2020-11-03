<template>
    <div>
        <div id="form">
            
            <b-form-input :state="idNumberState" class="input" v-model="pass.idNumber" placeholder="Numer identyfikatora parkingowego: "></b-form-input>

            <div id="buttons">
                <b-button @click="addPass()" id="addButton">Dodaj przepustkę</b-button>
                <b-button @click="deletePasses()" id="deleteButton">Usuń zaznaczone</b-button>
                <b-button @click="print()" id="printButton">Wygeneruj zaznaczone</b-button>
            </div>
        </div>
        <div id="list">
            <b-table 
            ref="selectableTable"
            selectable
            :select-mode="selectMode" 
            striped hover 
            :items="passesArray" 
            :bordered="true"
            :fields="fields"
            @row-selected="onRowSelected"
            responsive="sm">

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
            passType: "G",
            pass: {
                idNumber:'',
                printed: 'Nie wygenerowano',
                type: "G",
            },
            modes: ['multi', 'single', 'range'],
            selectMode: 'range',
            selected: [],
            idNumberError: false,
            idNumberState: null,
            valid: true,
            passesArray: [],
            fields: [
                {
                key: 'selected',
                label: 'Zaznaczone',
                }, 
                {
                key: 'idNumber',
                label: 'Numer Identyfikatora parkingowego',
                sortable: true
                },
                {
                key: 'printed',
                label: 'Status',
                sortable: true
                },
            ]     
        }
    },
    async created(){
        await this.getPasses();
    },
    computed: {
        database(){
            return firebase.database();
        },
        rootRef(){
            return this.database.ref('/car_passes')
        }
    },    
    methods: {
        onRowSelected(items) {
            this.selected = items
        },
        print() {
            if(this.selected.length==0) {
                alert("Nie zaznaczono przepustek do wydruku!")
            }
            else {
                this.updateStatus();
                const doc = new jsPDF('l', 'mm', [135,95]);
                let counter = 1;
                for( let elem of this.selected){
                    doc.setFont("Times New Roman","bold");
                    doc.setFontSize(32);
                    doc.text(10,50, elem.idNumber);
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
                    passKey: pass.passKey,
                    type: pass.type,
                }
                updates['/car_passes/' + pass.passKey] = newData;
                this.database.ref().update(updates)   
            }
            this.passesArray=[];
            this.getPasses();
        },
        async addPass() {
            await this.validation();
            if(this.valid==true){       
                
                const autoId = this.rootRef.push().key
                this.rootRef.child(autoId).set({
                    idNumber: this.pass.idNumber,
                    printed: this.pass.printed,
                    type: this.pass.type,
                    passKey: autoId,
               })
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
        async getPasses(){
            let app = this;
            this.passesArray=[];
            await this.rootRef.orderByChild('type').equalTo(app.passType).on('value', function(snapshot) {
                snapshot.forEach(function(data) {
                    app.passesArray.unshift(data.val());
                });            
            });
        },
        deletePasses(){
            for(let pass of this.selected){
                this.passesArray=[];
                this.rootRef.child(pass.passKey).remove()
            }
            this.passesArray=[];
            this.getPasses();
        },
        clearForm(){
            this.pass.idNumber="";
            this.pass.carRegistrationNumber="";
            this.pass.phoneNumber="";
        },
        validation(){
            if(this.pass.idNumber=="") {
                this.valid=false;
                this.idNumberState=false;
            }
            else {
                this.idNumberState=true;
            }
        }
    },
}
</script>

<style scoped>
.input {
  text-align: left;
  width: 550px;
  margin-top: 20px;
}
.input:focus {
    box-shadow: 0 0 0 0.2rem rgba(175, 163, 240, 0.692) !important;
}
#form {
  width: 30vw;
  margin-left: 10%;
}
#addButton, #deleteButton, #printButton {
  margin-right: 15px;
  background-color: transparent;
  border: 1px solid #6986e7;
  color: #6986e7;
}
#addButton:hover, #deleteButton:hover, #printButton:hover {
    background-color: #6986e7;
    border: 1px solid #6986e7;
    color: aliceblue;
}
#buttons {
  width: 541px;
  margin-top: 20px;
  margin-bottom: 20px;
}
.validation{
  color: red;
  font-size: 13px;
  margin: 0px;
  padding: 0px;
  margin-left: 20px;
  float:left;
}
.form-control:focus {
    box-shadow: 0 0 0 0.2rem rgba(159, 191, 221, 0.692) !important;
}
#list {
    width: 80% !important;
    margin-left: 10%;
}
.invalid-feedback {
  margin-top: 0%;
  margin-bottom: 0%;
  text-align: left;
}
</style>