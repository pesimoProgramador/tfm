function autorizar() {
    realtimeUtils.authorize(function(response){
        if (response.error) {
            iniciar_sesion()     
        } else {
            realtimeUtils.load(id_documento, onFileLoaded, onFileInitialize)
        }
    }, false);
}

function iniciar_sesion() {
    realtimeUtils.authorize(function(response){
        realtimeUtils.load(id_documento, onFileLoaded, onFileInitialize)        
    }, true);
}

function onFileInitialize() {

}

var documento
var lista_grupos
var string_examen_activado

function onFileLoaded(doc) {
    documento = doc
    
    lista_grupos = cargar_objeto_colaborativo(documento, 'lista_grupos')
    string_examen_activado = cargar_objeto_colaborativo(documento, 'string_examen_activado')
    string_examen_activado.setText("0")

    permisos()
}

function permisos() {
    //Con un for no funciona.
    var id_intervalo = 0
    var i = 0
    var j = 0
    var num_grupos = lista_grupos.length

    id_intervalo = setInterval ( function() {
        if (i >= num_grupos) {
            clearInterval(id_intervalo)
            formulario()
        } else {
            var longitud_lista_miembros = lista_grupos.get(i).miembros.length
            
            if (longitud_lista_miembros > 0) {
                if (j < longitud_lista_miembros) {
                    var correo = lista_grupos.get(i).miembros[j].correo
                    window.gapi.client.load('drive', 'v2', function() {
                        window.gapi.client.drive.permissions.getIdForEmail({
                            'email': correo,
                        }).execute(function(response) {
                            window.gapi.client.drive.permissions.delete({
                                'fileId': id_documento,
                                'permissionId': response.id
                            }).execute()
                        })
                    })
                    j += 1

                    if (j >= longitud_lista_miembros) {
                        j = 0
                        i += 1
                    }
                }
            } else {
                i += 1
            }
        }
    }, 1000);
}

function formulario() {
    var div_formulario = document.getElementById("div_formulario")
	
    var form = document.createElement("form")
    form.setAttribute("method","get")
    form.setAttribute("action","desactivar_examen.php")
    form.setAttribute("style", "display:none")

    //El id de la vista
    var input_id = document.createElement("input")
    input_id.setAttribute("name", "id")
    input_id.setAttribute("type", "hidden")
    input_id.setAttribute("value",  id)

    var input_examen_activado = document.createElement("input")
    input_examen_activado.setAttribute("name", "examen_activado")
    input_examen_activado.setAttribute("type", "hidden")
    input_examen_activado.setAttribute("value", parseInt(string_examen_activado.getText()))

    var input_submit = document.createElement("input")
    input_submit.setAttribute("type", "submit")
    input_submit.setAttribute("value", "Desactivar examen")

    form.appendChild(input_id)
    form.appendChild(input_examen_activado)
    form.appendChild(input_submit)

    div_formulario.innerHTML = ''
    div_formulario.appendChild(form)

    form.submit()
}