"use strict"

var opt = new Options();
opt.getHash();

var stage = new StageMaps("container", opt);
stage.initStage();

// var formJSON = {
//     header: "Заголовок",
//     rows: [
//         {type: "input", val: "", placeholder: "text"},
//         {type: "input", val: "", placeholder: "text"},
//         {type: "input", val: "", placeholder: "text"},
//         {type: "input", val: "", placeholder: "text"},
//         {type: "select", val: ["123", "321"], placeholder: "text"},
//         {type: "select", val: ["123", "321"], placeholder: "text"},
//     ],
//     submit: [
//         {val: "send", id: "sendForm", extclass: "sendForm"},
//         {val: "cancel", id: "cancelForm", extclass: "cancelForm"},
//     ]
// }

var form = new EditableForm("eform");
// form.makeFromJSON(JSON.stringify(formJSON));
// form.showForm();