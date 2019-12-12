
var values_currently_selected = [];
var options_that_are_selected_by_user = [];

var attribute_unique_data_values = {};

var attribute_type = {};
// Just setting some random data
attribute_type['test'] = 'something';


$.ajax({
    url:'/page2/',
    type: 'POST',
    data: attribute_type,
}).done(function (data) {
    var get_data = {};
    //  Get the data in the jSON format
    for (var summ_attr in data) {
        var curr_attribute = data[summ_attr];
        curr_attribute = curr_attribute.replace(/'/g, '"');
        curr_attribute = JSON.parse(curr_attribute);
        get_data[summ_attr] = curr_attribute;
    }

    attribute_unique_data_values = get_data;

    // var attributes = document.getElementById("attributesSchema");
    var attributes = document.getElementById("all_attributes");

    while(attributes.hasChildNodes()) {
        attributes.removeChild(attributes.firstChild);
    }

    // Create the options group for each attribute
    var optgroup = document.createElement("optgroup");
    optgroup.label = "Attributes";
    optgroup.id = "Attributes";
    for (var attr in attribute_unique_data_values) {
        var option = document.createElement("option");
        option.setAttribute("class", "l1");
        var actual_text = attr + ":" + attr;
        option.setAttribute("value", actual_text);
        option.text = attr;
        optgroup.appendChild(option);

        for (var unique_value in attribute_unique_data_values[attr]) {
            var option = document.createElement("option");
            option.setAttribute("class", "l2");
            var actual_text = attr + ":" + attribute_unique_data_values[attr][unique_value];
            option.setAttribute("value", actual_text);
            option.text = actual_text;
            optgroup.appendChild(option);
        }
    }
    attributes.appendChild(optgroup);

    // Create the optgroup for graphs
    var optgroup = document.createElement("optgroup");
    optgroup.label = "GraphType";
    optgroup.id = "Graph"
    var graph_types = ['bargraph', 'groupedBargraph', 'heatmap', 'histogram', 'scatter', 'boxplot'];
    for (var i = 0; i< graph_types.length; i++) {
        var option = document.createElement("option");
        option.setAttribute("value", graph_types[i]);
        option.text = graph_types[i];
        optgroup.appendChild(option);
    }
    attributes.appendChild(optgroup);

    // Create the optgroup for order by function
    var optgroup = document.createElement("optgroup");
    optgroup.label = "OrderBy(Default - Descending)";
    optgroup.id = "Ordering"
    var ordering = ['Score', 'Support'];
    for (var i = 0; i< ordering.length; i++) {
        var option = document.createElement("option");
        option.setAttribute("value", ordering[i]);
        option.text = ordering[i];
        optgroup.appendChild(option);
    }
    attributes.appendChild(optgroup);
});

//------------------------------------------------------------------------------
// This is the javascript query for the standalone select/search bar

$("#all_attributes").select2({
    placeholder: 'Select Attributes/Graphs',
    allowClear: false,
    // maximumSelectionLength: 5,
    // maximumSelectionLength: (Object.keys(attribute_unique_data_values).length + 5),
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

$(function () {
    $("#submit").bind("click", function () {
        var main = document.getElementsByClassName("main");
        main.q.value = "";

        var chosen_value = $('#all_attributes').val();
        console.log(chosen_value);
        for (var i = 0; i < chosen_value.length; i ++) {

            var actual_id = chosen_value[i].substr(0, chosen_value[i].indexOf(':'));
            var actual_text = chosen_value[i].substr(chosen_value[i].indexOf(':') + 1);

            if (actual_id === actual_text) {
                main.q.value += " " + actual_text;
            }
            else {
                main.q.value += " " + chosen_value[i];
            }
        }

    });
});


// Always listening
// # If some of the tags are removed or added in the section - Top questions based on tags
// $( "#all_attributes" ).change(function() {
$( "#all_attributes" ).on('select2:select', function(e) {

    // Get the selected id and text, where id is the option value and text is the option text
    var selected_id = e.params.data.id;
    var selected_text = e.params.data.text;

    //Separate the actual attribute name and attribute value
    var actual_id = selected_id.substr(0, selected_id.indexOf(':'));
    var actual_text = selected_text.substr(selected_text.indexOf(':') + 1);


    // NOTE : Score and support have been added in graph types
    var graph_types = ['bargraph', 'groupedBargraph', 'heatmap', 'histogram', 'scatter', 'boxplot', 'Score', 'Support'];

    // NOTE : The second condition is for graphs and order by
    if (!graph_types.includes(actual_id) && actual_id !== "") {

        // Update the universal holder of items selected - essentially if an attribute is selected
        if (actual_id === actual_text) {
            values_currently_selected.push(actual_id);
        }

        // Give a warning to the user is more than two attributes are selected
        if (values_currently_selected.length > 2 && actual_text === actual_id) {
            alert("Cannot select more than two attributes!!!");

            // Remove the attribute that the user could not add
            var curr_index = values_currently_selected.indexOf(actual_id);
            if (curr_index !== -1) {
                values_currently_selected.splice(curr_index, 1);
            }

            $('#all_attributes').val(options_that_are_selected_by_user);
            $('#all_attributes').trigger('change'); // Notify any JS components that the value changed
            $('#all_attributes').select2('close');
        }

        else
        {
            // Add to search bar
            var main = document.getElementsByClassName("main");
            main.q.value += " " + selected_text;

            // $('#all_attributes optgroup[label="Attributes"] option[value="GRADE"]').remove()
            var attributes = document.getElementById("Attributes");

            var attributes_to_destroy = [];

            // Create the options group for each attribute
            for (var i = 0; i < attributes.children.length; i++) {

                var actual_attribute_value = attributes.children[i].value;
                actual_attribute_value = actual_attribute_value.substr(0, actual_attribute_value.indexOf(':'))

                if (actual_attribute_value === actual_id) {
                    attributes_to_destroy.push(attributes.children[i].value);
                }
            }

            // Remove the attribute and its sub parts that were selected
            for (var i = 0; i < attributes_to_destroy.length; i++) {
                $("#all_attributes optgroup[label='Attributes'] option[value='" + attributes_to_destroy[i] + "']").remove();
            }

            // We have to add back the attribute that was selected
            // There are two cases - Attribute selected or sub-attribute selected
            if (actual_id === actual_text) {
                var option = document.createElement("option");
                option.setAttribute("class", "l1");
                option.setAttribute("value", selected_id);
                option.text = actual_id;
                attributes.appendChild(option);
            } else {
                var option = document.createElement("option");
                option.setAttribute("class", "l2");
                option.setAttribute("value", selected_id);
                option.text = selected_text;
                attributes.appendChild(option);
            }
            options_that_are_selected_by_user.push(selected_id);

            $('#all_attributes').val(options_that_are_selected_by_user);
            // $('#all_attributes').trigger ('change'); // Notify any JS components that the value changed
            // $('#all_attributes').select2('close');


            // Refresh button
            $("#all_attributes").select2({
                placeholder: 'Select Attributes/Graphs',
                allowClear: false,
                maximumSelectionLength: (Object.keys(attribute_unique_data_values).length + 5),
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
                // },
                // templateSelection: function(item) {
                //     var selected_id = item.id;
                //     var selected_text = item.text;
                //
                //     if (selected_text !== selected_id) {
                //         return selected_id + ":" + selected_text;
                //     }
                //     else {
                //         return selected_id;
                //     }
                // }
            });
        }
    }

    else {

        // Add to search bar
        var main = document.getElementsByClassName("main");
        main.q.value += " " + selected_text;

        options_that_are_selected_by_user.push(selected_id);

        $('#all_attributes').val(options_that_are_selected_by_user);
    }

});

$( "#all_attributes" ).on('select2:unselect', function(e) {

    var selected_id = e.params.data.id;
    var selected_text = e.params.data.text;

    //Separate the actual attribute name and attribute value
    var actual_id = selected_id.substr(0, selected_id.indexOf(':'));
    var actual_text = selected_text.substr(selected_text.indexOf(':') + 1);


    // NOTE : Score and support have been added in graph types
    var graph_types = ['bargraph', 'groupedBargraph', 'heatmap', 'histogram', 'scatter', 'boxplot', 'Score', 'Support'];

    // NOTE : The second condition is for graphs and order by
    if (!graph_types.includes(actual_id) && actual_id !== "") {

        // Remove from search bar
        var main = document.getElementsByClassName("main");
        main.q.value = main.q.value.trim();
        main.q.value = main.q.value.replace(selected_text, "");

        // For double surity
        if ($('#all_attributes').val().length === 0) {
            main.q.value = "";
        }

        // Update the universal holder of items selected
        if (actual_id === actual_text) {
            var curr_index = values_currently_selected.indexOf(actual_id);
            if (curr_index !== -1) {
                values_currently_selected.splice(curr_index, 1);
            }
        }


        // Remove the attributes based on the selection made
        var attributes = document.getElementById("Attributes");

        // Create the options group for each attribute
        for (var i = 0; i < attributes.children.length; i++) {

            if (attributes.children[i].value === selected_id) {
                $("#all_attributes optgroup[label='Attributes'] option[value='" + attributes.children[i].value + "']").remove();
            }
        }
        // Add the attribute that was removed
        // Create the options group for each attribute
        var option = document.createElement("option");
        option.setAttribute("class", "l1");
        var attr_attr = actual_id + ":" + actual_id;
        option.setAttribute("value", attr_attr);
        option.text = actual_id;
        attributes.appendChild(option);
        for (var unique_value in attribute_unique_data_values[actual_id]) {
            var option = document.createElement("option");
            option.setAttribute("class", "l2");
            var actual_text = actual_id + ":" + attribute_unique_data_values[actual_id][unique_value];
            option.setAttribute("value", actual_text);
            option.text = actual_text;
            attributes.appendChild(option);
        }
        var curr_index = options_that_are_selected_by_user.indexOf(selected_id);
        if (curr_index !== -1) {
            options_that_are_selected_by_user.splice(curr_index, 1);
        }


        $('#all_attributes').val(options_that_are_selected_by_user);
        // $('#all_attributes').trigger ('change'); // Notify any JS components that the value changed
        // $('#all_attributes').select2('close');

        // Refresh button
        $("#all_attributes").select2({
            placeholder: 'Select Attributes/Graphs',
            allowClear: false,
            maximumSelectionLength: (Object.keys(attribute_unique_data_values).length + 5),
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

    }

    else {

        // Remove from search bar
        var main = document.getElementsByClassName("main");
        main.q.value = main.q.value.trim();
        main.q.value = main.q.value.replace(selected_text, "");

        var curr_index = options_that_are_selected_by_user.indexOf(selected_id);
        if (curr_index !== -1) {
            options_that_are_selected_by_user.splice(curr_index, 1);
        }

        $('#all_attributes').val(options_that_are_selected_by_user);
    }

});