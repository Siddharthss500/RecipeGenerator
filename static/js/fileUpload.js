
// Global variables
var header_row;
var file_name;

window.all_data = {};
window.attribute_type = {};
window.attributes_to_keep = {}

// Show list of datasets that are already loaded into mysql
var random_table_list = {};
random_table_list['table'] = "Some_random_data";
// Call the function update_table
update_table(random_table_list);

// // Event listener for the datasets already loaded
// document.getElementById("list_group").addEventListener("click",function(e) {
//
//     // Navigate to the corresponding page
//     window.location.href = "/ba/dataset/" + e.target.innerText;
// });

// Event listener for the search button
document.getElementById("btnSubmit").addEventListener("click",function(e) {
    alert("You cannot search anything here.");
    // window.location.href = "/";
});

// Event based function for click on upload
$(function () {
    $("#upload").bind("click", function () {


        // Check if there is a file to upload
        var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/;
        if (regex.test($("#fileUpload").val().toLowerCase())) {

            // Get the filename
            var files = document.getElementById("fileUpload");
            file_name = files.files[0].name;
            file_name = file_name.replace('.csv', '');

            var table_list = {};
            table_list['table'] = file_name;

            var flag = 0;

            // Check the tables present in the database
            $.ajax({
                url: '/tablecheck/',
                type: 'POST',
                data: table_list,
                async: false,
            }).done(function (data) {

                var all_data = data['tables'];

                for (var table in all_data) {
                    if (file_name === all_data[table]) {
                        flag = 1;
                    }
                }

                // Check the flag value - If the dataset is already present
                if (flag === 1) {
                    var modal = document.getElementById("reloadModal");
                    var yes_span = document.getElementsByClassName("yes")[0];
                    var no_span = document.getElementsByClassName("no")[0];
                    modal.style.display = "block";

                    yes_span.onclick = function () {
                        modal.style.display = "none";

                        // Clear the all_data variable
                        window.all_data = {};

                        file_and_data_loader();
                    }

                    no_span.onclick = function () {
                        modal.style.display = "none";

                        // Navigate to the corresponding page
                        window.location.href = "/ba/dataset/" + file_name;
                    }
                } else {
                    // Clear the all_data variable
                    window.all_data = {};

                    file_and_data_loader();
                }
            });
        }
        // If no file has been selected to upload
        else {
            alert("Please upload a valid CSV file.");
        }

    });
});


document.getElementById("okay").addEventListener("click", function(){

    var schema_tag = document.getElementById("schema");

    window.attribute_type = {};
    var number_of_numerical_count = 0;

    for (var i = 0; i < schema_tag.children.length; i++) {
        var name = schema_tag.children[i].children[1].children[0].children[0].name;
        var chosen_or_not = (schema_tag.children[i].children[1].children[0].children[0].checked).toString();
        attribute_type[name] = chosen_or_not;

        // Store the attribute types in the input
        var cat_num = document.getElementById("cat_num");
        cat_num.value = JSON.stringify(attribute_type);

        if (chosen_or_not !== "false") {
            number_of_numerical_count += 1;
        }
    }

    // Check to see if the user has selected all categorical variables
    if (number_of_numerical_count === 0) {
        // Throw a warning to the user that all categorical variables have been selected
        var modal = document.getElementById("categoryModal");
        var yes_span = document.getElementsByClassName("ohyeah")[0];
        var no_span = document.getElementsByClassName("ohno")[0];
        modal.style.display = "block";

        yes_span.onclick = function () {
            modal.style.display = "none";

            // Ask the user for the minimum support
            var minsupmodal = document.getElementById("minsupModal");
            var minsupyeah = document.getElementsByClassName("minsupyeah")[0];
            minsupmodal.style.display = "block";

            minsupyeah.onclick = function () {
                minsupmodal.style.display = "none";

                // Data for the file uploaded
                var file_data = {};
                var timestamp = (new Date().getTime()).toString();
                file_data['filename'] = file_name + timestamp;
                file_data['actual_filename'] = file_name;
                file_data['status'] = 'Uploaded';
                file_data['timestamp'] = timestamp;
                file_data['progress'] = '0';

                var actual_file_data = JSON.parse(JSON.stringify(file_data));

                $.ajax({
                    url: '/tableadd/',
                    type: 'POST',
                    data: actual_file_data,
                    dataType: "json",
                    async: false,
                }).done(function (message) {
                    console.log(message);
                });

                // Submit the form
                // document.getElementById('theform').submit();
                document.theform.submit();
            }
        }

        no_span.onclick = function () {
            modal.style.display = "none";

            window.all_data = {};

            file_and_data_loader();
        }
    }

    else {

        // Ask the user for the minimum support
        var minsupmodal = document.getElementById("minsupModal");
        var minsupyeah = document.getElementsByClassName("minsupyeah")[0];
        minsupmodal.style.display = "block";

        minsupyeah.onclick = function () {
            minsupmodal.style.display = "none";

            // Data for the file uploaded
            var file_data = {};
            var timestamp = (new Date().getTime()).toString();
            file_data['filename'] = file_name + timestamp;
            file_data['actual_filename'] = file_name;
            file_data['status'] = 'Uploaded';
            file_data['timestamp'] = timestamp;
            file_data['progress'] = '0';

            var actual_file_data = JSON.parse(JSON.stringify(file_data));

            $.ajax({
                url: '/tableadd/',
                type: 'POST',
                data: actual_file_data,
                dataType: "json",
                async: false,
            }).done(function (message) {
                console.log(message);
            });

            // Submit the form
            // document.getElementById('theform').submit();
            document.theform.submit();
        }
    }
});




//------------------------------------------------------------------------------

//*********************************************************************
// Standlone functions

// Loading the file and data
function file_and_data_loader() {

    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/;
    if (regex.test($("#fileUpload").val().toLowerCase())) {
        if (typeof (FileReader) != "undefined") {
            var reader = new FileReader();
            reader.onload = function (e) {

                var rows = e.target.result.split("\n");

                // Get the header
                header_row = rows[0].split(",");
                var new_header_list = [];

                // Get attributes to put in the exclusion list, that will be selected by the user
                var exclude_list = document.getElementById("attributesStuff");

                while(exclude_list.hasChildNodes()) {
                    exclude_list.removeChild(exclude_list.firstChild);
                }

                for(var i = 0; i < header_row.length; i++) {
                    var label = document.createElement("label");
                    var input = document.createElement("input");

                    label.setAttribute("class", "checkbox-inline");
                    label.setAttribute("style", "font-size: medium");
                    label.textContent = header_row[i];

                    input.setAttribute("type", "checkbox");
                    input.value = header_row[i];
                    input.setAttribute("name", "Checkbox[]");

                    label.appendChild(input);

                    exclude_list.appendChild(label);
                }

                // Show the user the attributes to exclude
                var excludemodal = document.getElementById("requiredModal");
                var okay_span = document.getElementsByClassName("itsokay")[0];
                excludemodal.style.display = "block";

                okay_span.onclick = function() {
                    excludemodal.style.display = "none";

                    window.attributes_to_keep = {};

                    var attributes_left = document.getElementById("attributesStuff");

                    for (var i = 0; i < attributes_left.children.length; i++) {
                        var name = attributes_left.children[i].children[0].value;
                        var value = attributes_left.children[i].children[0].checked;
                        window.attributes_to_keep[name] = (value).toString();

                        // Create a list of all attributes that need to be included
                        if (value === false) {
                            new_header_list.push(name);
                        }
                    }

                    // Store the attributes that need to be included/excluded in the input
                    var selectedornot = document.getElementById("selectedornot");
                    selectedornot.value = JSON.stringify(window.attributes_to_keep);

                    var pop_up_list = document.getElementById("schema");

                    while(pop_up_list.hasChildNodes()) {
                        pop_up_list.removeChild(pop_up_list.firstChild);
                    }

                    for(var i = 0; i < new_header_list.length; i++) {

                        var fieldset = document.createElement("fieldset");

                        var para = document.createElement("p");
                        var text_content = document.createTextNode(new_header_list[i] + " :  ")
                        para.appendChild(text_content);
                        para.setAttribute("style", "display:inline-block");

                        fieldset.appendChild(para);

                        var para = document.createElement("p")
                        para.setAttribute("style", "display:inline-block");

                        var label = document.createElement("label");
                        var input = document.createElement("input");
                        input.setAttribute("type", "radio");
                        input.setAttribute("name", new_header_list[i]);
                        input.setAttribute("value", new_header_list[i]+"_num");
                        // input.setAttribute("checked", true);

                        var text_content = document.createTextNode("Numerical")
                        label.appendChild(input);
                        label.appendChild(text_content);

                        para.appendChild(label);

                        var label = document.createElement("label");
                        var input = document.createElement("input");
                        input.setAttribute("type", "radio");
                        input.setAttribute("name", new_header_list[i]);
                        input.setAttribute("value", new_header_list[i]+"_cat");
                        input.setAttribute("checked", true);

                        var text_content = document.createTextNode("Categorical")
                        label.appendChild(input);
                        label.appendChild(text_content);

                        para.appendChild(label);

                        fieldset.appendChild(para);

                        pop_up_list.appendChild(fieldset);
                    }

                    var modal = document.getElementById("myModal");
                    var span = document.getElementsByClassName("close")[0];
                    modal.style.display = "block";

                    span.onclick = function () {
                        modal.style.display = "none";
                    }

                    // All data including the header
                    for (var i = 0; i < rows.length; i++) {
                        if (rows[i] !== "") {
                            var cells = rows[i].splitCSV();
                            window.all_data[i] = cells.toString();
                        }
                    }

                }
            }
            // reader.readAsText($("#fileUpload")[0].files[0]);
            reader.readAsBinaryString($("#fileUpload")[0].files[0]);
        } else {
            alert("This browser does not support HTML5.");
        }
    } else {
        alert("Please upload a valid CSV file.");
    }
}

// String reformatting for csv input
String.prototype.splitCSV = function() {
    var matches = this.match(/(\s*"[^"]+"\s*|\s*[^,]+|,)(?=,|$)/g);
    for (var n = 0; n < matches.length; ++n) {
        matches[n] = matches[n].trim();
        if (matches[n] == ',') matches[n] = '';
    }
    if (this[0] == ',') matches.unshift("");
    return matches;
}

// Function to update the dataset list
function update_table(random_table_list) {
    $.ajax({
        url:'/tablecheck/',
        type: 'POST',
        data: random_table_list,
        async: false,
    }).done(function (data) {
        var all_data = data['tables'];
        var all_status = data['status'];
        var all_space = data['space'];

        var list_group = document.getElementById("list_group");

        while(list_group.hasChildNodes()) {
            list_group.removeChild(list_group.firstChild);
        }
        if (all_data.length > 0) {
            for (var table in all_data) {
                var li = document.createElement("li");
                var a = document.createElement("a");
                a.innerText = all_data[table];
                li.setAttribute("class", "list-group-item");
                li.setAttribute("style", "font-weight: bolder; font-size: small;  padding: 10px;");
                li.id = all_data[table];
                var link = "/ba/dataset/" + all_data[table]

                var span = document.createElement("span");

                // Set no link for disk full
                if (all_status[table] === "Out of Space") {
                    a.setAttribute("href", "#");
                    span.setAttribute("class", "home-description left disk-full")
                }
                else {
                    a.setAttribute("href", link);
                    span.setAttribute("class", "home-description left")
                }
                span.append(a);
                li.appendChild(span);

                var a = document.createElement("a");
                if (all_status[table] === "Uploaded") {
                    a.setAttribute("style", "color: blue");
                }
                else if (all_status[table] === "Processing") {
                    a.setAttribute("style", "color: orangered");
                    processing_count += 1;
                }
                else if (all_status[table] === "Error") {
                    a.setAttribute("style", "color: red");
                }
                else if (all_status[table] === "Out of Space") {
                    a.setAttribute("style", "color: red");
                }
                else {
                    a.setAttribute("style", "color: seagreen");
                }
                a.innerText = all_status[table];
                a.setAttribute("class", "right");
                var span = document.createElement("span");

                // Set no link for disk full
                if (all_status[table] === "Out of Space") {
                    a.setAttribute("href", "#");
                    span.setAttribute("class", "left disk-full");
                }
                else {
                    a.setAttribute("href", link);
                    span.setAttribute("class", "left");
                }

                span.setAttribute("style", "padding-left: inherit; margin-left: inherit;")
                span.append(a);
                li.appendChild(span);

                // Add the space left
                var span = document.createElement("span");
                span.setAttribute("class", "left");
                var a = document.createElement("a");
                a.innerText = all_space[table];
                span.setAttribute("style", "padding-left: inherit; margin-left: inherit;")
                span.append(a);
                li.appendChild(span);

                // Add the delete button
                var button = document.createElement("button");
                button.setAttribute("type", "button");
                // button.setAttribute("@click", "deleteItem(index)");
                button.setAttribute("class", "right delete");
                button.id = all_data[table];
                button.innerText = "X";
                li.append(button);

                list_group.appendChild(li);
            }
        }
    });
}

function deleteready() {
    // Event listener for deleting datasets
    [...document.querySelectorAll('.delete')].forEach(function (item) {
        item.addEventListener('click', function () {
            // Get the name of the dataset to delete
            var data_to_delete = item.id;

            // Show the modal to confirm if the user wants to delete or not
            var modal = document.getElementById("confirmModal");
            var yes_span = document.getElementsByClassName("sadyeah")[0];
            var no_span = document.getElementsByClassName("sadno")[0];
            modal.style.display = "block";

            yes_span.onclick = function () {
                modal.style.display = "none";

                var file_data = {};
                file_data['filename'] = data_to_delete;
                file_data['page'] = "Page1";

                var actual_file_data = JSON.parse(JSON.stringify(file_data));

                // Call the ajax function to delete the dataset
                $.ajax({
                    url: '/tabledelete/',
                    type: 'POST',
                    data: actual_file_data,
                    dataType: "json",
                    async: false,
                }).done(function (message) {

                    // Refresh the dataset list
                    update_table(random_table_list);
                    window.location.href = message['url'];

                });
            }
            no_span.onclick = function () {
                modal.style.display = "none";
            }

        });
    });

    // Event listener for datasets that have status = "Disk Full"
    [...document.querySelectorAll('.disk-full')].forEach(function (item) {
        item.addEventListener('click', function () {
            // Show alert
            alert("Please delete this dataset!!")
        });
    });
}

//------------------------------------------------------------------------------
// This is the javascript query for the standalone select/search bar

$("#all_attributes").select2({
    placeholder: 'Select Attributes/Graphs',
    allowClear: false,
    templateResult: function (data) {
        // We only really care if there is an element to pull classes from
        if (!data.element) {
            return data.text;
        }

        var $element = $(data.element);

        var $wrapper = $('<span></span>');
        $wrapper.addClass($element[0].className);

        $wrapper.text(data.text);

        return $wrapper;
    }
});

//Calling runner2 once
runner2();

// Function to ping continuously and inform the user that the disk is full
var processing_count = 1;

function ping2() {
    processing_count = 0;
    // Call update table
    update_table(random_table_list);
    deleteready();
    // console.log(processing_count);
}
// Function to continuosly ping
function runner2(){
    ping2()
    setTimeout( () => {
        if (processing_count  != 0) {
            runner2();
        }
    }, 5000)
}


//Calling runner once
// runner();

// // Function to ping continuously and inform the user that the disk is full
// var diskfull_count = -1;
//
// function ping() {
//     diskfull_count = 0;
//     // Call update table
//     update_table(random_table_list);
//     deleteready();
//
//     var modal = document.getElementById("diskfullModal");
//     modal.style.display = "block";
//
//     // Wait for 5 seconds and then stop the display
//     setTimeout(function(){modal.style.display = "none";}, 5000);
// }
// // Function to continuosly ping
// function runner(){
//     ping()
//     setTimeout( () => {
//         if (diskfull_count  != 0) {
//             runner();
//         }
//     }, 5000)
// }

// //Calling runner2 once
// runner2();
//
// // Function to ping continuously and inform the user that the disk is full
// var current_space_that_is_filled = "";
//
// function ping2() {
//
//     var some_data = {};
//     some_data['something'] = 'something_else';
//
//     $.ajax({
//         url:'/diskcheck/',
//         type: 'POST',
//         data: some_data,
//         dataType: "json",
//         async: false
//     }).done((data)=> {
//
//         var current_amount_full = parseInt(data['value']);
//         current_space_that_is_filled = current_amount_full;
//
//         if (current_amount_full >= 97) {
//             // Show the user the pop-up to re-run the code again
//             var modal = document.getElementById("diskfullModal");
//             modal.style.display = "block";
//
//             // Wait for 5 seconds and then stop the display
//             setTimeout(function(){modal.style.display = "none";}, 5000);
//         }
//     });
// }
// // Function to continuosly ping
// function runner2(){
//     ping2()
//     setTimeout( () => {
//         if (current_space_that_is_filled >= 97) {
//             runner2();
//         }
//     }, 1000)
// }