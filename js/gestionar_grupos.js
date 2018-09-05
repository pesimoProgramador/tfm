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

function onFileInitialize(model) {

}

var documento
var lista_grupos

function onFileLoaded(doc) {
    documento = doc

    lista_grupos = cargar_objeto_colaborativo(documento, "lista_grupos")
    lista_colaboradores = cargar_objeto_colaborativo(documento, "lista_colaboradores")

    lateral_colaboradores()
    cargar_checkbox_lista_grupos()
    eventos()
}

function cargar_checkbox_lista_grupos() {
    var checkbox_grupos = document.getElementsByName("checkbox_grupos")

    for (var i = 0; i < lista_grupos.length; i++) {
        for (var j = 0; j < grupos.length; j++) {
            if (lista_grupos.get(i).nombre_grupo == grupos[j].nombre_grupo) {
                checkbox_grupos[j].checked = true
            }
        }
    }
}

function eventos() {
    documento.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_JOINED, colaboradores)
    documento.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_LEFT, colaboradores)
    lista_grupos.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, lista_grupos_cambiada)
    lista_grupos.addEventListener(gapi.drive.realtime.EventType.VALUES_REMOVED, lista_grupos_cambiada)
}

function lista_grupos_cambiada(evt) {
    if (!evt.isLocal) {
        var checkbox_grupos = document.getElementsByName("checkbox_grupos")

        if (evt.type == "values_added"){
            checkbox_grupos_seleccionado(true, checkbox_grupos, evt)
        } else if (evt.type == "values_removed") {
            checkbox_grupos_seleccionado(false, checkbox_grupos, evt)
        }
    }
}

function checkbox_grupos_seleccionado(check, checkbox_grupos, evt) {
    for (var i = 0; i < grupos.length; i++) {
        if (grupos[i].nombre_grupo == evt.values[0].nombre_grupo) {
            checkbox_grupos[i].checked = check
            break
        }
    }
}

function checkbox_cambiado(value, checked) {
    if (checked) {
        lista_grupos.push(grupos[value])
    } else {
        for (var i = 0; i < lista_grupos.length; i++) {
            if (lista_grupos.get(i).nombre_grupo == grupos[value].nombre_grupo) {
                lista_grupos.remove(i)
                break
            }
        }
    }
}

