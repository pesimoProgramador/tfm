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

function onFileInitialize(model) {}

var lista_preguntas
var lista_grupos
var lista_colaboradores
var lista_caracteres
var documento
//var lista_items_timeline = []

function onFileLoaded(doc) {
    documento = doc
    lista_preguntas = cargar_objeto_colaborativo(documento, 'lista_preguntas')
    lista_grupos = cargar_objeto_colaborativo(documento, 'lista_grupos')
    lista_colaboradores = cargar_objeto_colaborativo(documento, 'lista_colaboradores')
    lista_caracteres = cargar_objeto_colaborativo(documento, 'lista_caracteres')

    lateral_colaboradores()
    cargar_examen(documento)
    eventos(documento)
}

function cargar_examen(documento) {
    var div_examen = document.getElementById("div_examen")

    for (var i = 1; i <= lista_preguntas.length; i++) {
        var div = document.createElement("div")

        div_examen.appendChild(div)
        cargar_textarea(lista_preguntas.get(i - 1), div, "Pregunta " + i)

        for (var j = 0; j < lista_grupos.length; j++) {
            var miembros = lista_grupos.get(j).miembros
            var nombre_grupo = lista_grupos.get(j).nombre_grupo
            var lista_respuestas_grupo = cargar_objeto_colaborativo(documento, "lista_respuestas_grupo_" + nombre_grupo)

            cargar_textarea(lista_respuestas_grupo.get(i - 1), div, "Respuesta " + i + " - " + nombre_grupo)
            //crear_timelines(nombre_grupo, i, div)
            //crear_graficas()
        }
    }
}

function cargar_textarea (string_colaborativo, div, titulo) {
    var h2 = document.createElement("h2")
    h2.innerHTML = titulo

    var textarea = document.createElement("textarea")
    textarea.className = "textarea_preguntas"

    gapi.drive.realtime.databinding.bindString(string_colaborativo, textarea)

    div.appendChild(h2)
    div.appendChild(textarea)
}

//var timeline

//function crear_timelines(nombre_grupo, i, div) {
//    var div_timeline = document.createElement("div")
//    div_timeline.id = "div" + nombre_grupo + i
//    div.appendChild(div_timeline)

//    var items = new vis.DataSet()
//    lista_items_timeline.push(items)

//    var options = {
//        start: new Date(),
//        end: new Date(new Date().getTime() + 1000000),
//        rollingMode: true
//    }

//    timeline = new vis.Timeline(div_timeline, items, options)
//}

function eventos(documento) {
    documento.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_JOINED, colaboradores)
    documento.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_LEFT, colaboradores)
    lista_preguntas.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, lista_preguntas_cambiada)
    lista_preguntas.addEventListener(gapi.drive.realtime.EventType.VALUES_REMOVED, lista_preguntas_cambiada)
}


function lista_preguntas_cambiada(evt) {
    var div_examen = document.getElementById("div_examen")
    
    if (evt.type == "values_added") {
        var div = document.createElement("div")
        cargar_textarea(lista_preguntas.get(evt.index), div, "Pregunta " + (evt.index + 1))

        for (var i = 0; i < lista_grupos.length; i++) {
            var lista_respuestas_grupo = cargar_objeto_colaborativo(documento, "lista_respuestas_grupo_" + lista_grupos.get(i).nombre_grupo)
            cargar_textarea(lista_respuestas_grupo.get(evt.index), div, "Respuesta " + (evt.index + 1) + " - " + lista_grupos.get(i).nombre_grupo)
        }
        div_examen.appendChild(div)        
    } else {
        div_examen.removeChild(div_examen.lastChild)
    }
}