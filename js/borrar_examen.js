function autorizar() {
    realtimeUtils.authorize(function(response){
        if (response.error) {
            iniciar_sesion()     
        } else {
            realtimeUtils.deleteFile(id_documento, ok)
        }
    }, false);
}

function iniciar_sesion() {
    realtimeUtils.authorize(function(response){
        realtimeUtils.deleteFile(id_documento, ok)
    }, true);
}

function ok(resp) {
    formulario()
}

function formulario() {
    var div_formulario = document.getElementById("div_formulario")
	
    var form = document.createElement("form")
    form.setAttribute("method","get")
    form.setAttribute("action","view.php")
    form.setAttribute("style", "display:none")

    //El id de la vista
    var input_id = document.createElement("input")
    input_id.setAttribute("name", "id")
    input_id.setAttribute("type", "hidden")
    input_id.setAttribute("value",  id)

    var input_submit = document.createElement("input")
    input_submit.setAttribute("type", "submit")
    input_submit.setAttribute("value", "Borrar")

    form.appendChild(input_id)
    form.appendChild(input_submit)

    div_formulario.appendChild(form)

    form.submit()
}