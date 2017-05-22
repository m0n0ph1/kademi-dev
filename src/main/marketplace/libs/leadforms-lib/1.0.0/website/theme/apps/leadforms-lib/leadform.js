function initAndPopulateLeadForm(editable) {
    var formData = JSON.parse($("#form-data").html());

    $.each(formData, function (key, value) {
        var input = $("[name='" + key + "']");

        if (input.is("select")) {
            $("[name='" + key + "'] [value='" + value + '"]').prop("selected", true);
        } else {
            $("[name='" + key + "']").val(value);
        }
    });

    if (!editable) {
        $("input[type = 'submit']").remove();
        $(":input").prop("readonly", true);
    } else {
        $("form").forms({
            callback: function (resp) {
                flog("done", resp);

                $("#container-content").html("<h1>Thank you!</h1><p style=\"margin-top: 30px;\">We have received your feedback, we will get to you shortly!</p>");
            },
            error: function (resp) {
                flog("error", resp);

                Msg.error("Error While Submitting Form");
            }
        });
    }
}