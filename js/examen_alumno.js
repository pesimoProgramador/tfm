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

var lista_preguntas
var lista_grupos
var lista_colaboradores
var lista_caracteres
var lista_respuestas_grupo
var grupo
var alumno
var documento

function onFileLoaded(doc) {
    documento = doc
    lista_preguntas = cargar_objeto_colaborativo(documento, 'lista_preguntas')
    lista_grupos = cargar_objeto_colaborativo(documento, 'lista_grupos')
    lista_colaboradores = cargar_objeto_colaborativo(documento, 'lista_colaboradores')
    lista_caracteres = cargar_objeto_colaborativo(documento, 'lista_caracteres')
    grupo = dame_el_grupo_en_donde_el_alumno_esta()
    console.log(grupo)
    alumno = dame_el_alumno_de_la_lista_colaboradores(correo, lista_colaboradores)
    cargar_examen(documento, grupo)
    eventos()
}

function dame_el_grupo_en_donde_el_alumno_esta () {
    for (var i = 0; i < lista_grupos.length; i++) {
		var grupo = lista_grupos.get(i)

		for (var j = 0; j < grupo.miembros.length; j++) {
			if (grupo.miembros[j].correo == correo) {
				return grupo
			}
		}
	}
 
    return -1
}

function dame_el_alumno_de_la_lista_colaboradores(correo, lista_colaboradores) {
    for (var i = 0; i < lista_colaboradores.length; i++) {
        var colaborador = lista_colaboradores.get(i)

        if (correo == colaborador.correo) {
            return colaborador
        }
    }

    return -1
}

function cargar_examen(documento, grupo) {
    var div_examen = document.getElementById("div_examen")
    
    if (grupo != -1) { 
        lista_respuestas_grupo = cargar_objeto_colaborativo(documento, "lista_respuestas_grupo_" + grupo.nombre_grupo)

        for (var i = 1; i <= lista_preguntas.length; i++) {
            var div = document.createElement("div")
            cargar_textarea(lista_preguntas.get(i - 1), div, "Pregunta " + i, "p")
            cargar_textarea(lista_respuestas_grupo.get(i - 1), div, "Respuesta " + i, "r")
            div_examen.appendChild(div)
        }
        eventos()
    } else {
        document.getElementById("div_interfaz").innerHTML = "Error"
    }
}

function cargar_textarea (stringColaborativo, div, valor, tipo) {
    var h2 = document.createElement("h2")
    h2.innerHTML = valor

    var textarea = document.createElement("textarea")
    textarea.className = "textarea_preguntas"

    if (tipo == "p") {
        textarea.disabled = true
    }

    gapi.drive.realtime.databinding.bindString(stringColaborativo, textarea)

    div.appendChild(h2)
    div.appendChild(textarea)
}

function eventos() {
    lista_preguntas.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, lista_preguntas_cambiada);
    lista_preguntas.addEventListener(gapi.drive.realtime.EventType.VALUES_REMOVED, lista_preguntas_cambiada);

    for (var j = 0; j < lista_respuestas_grupo.length; j++) {
        lista_respuestas_grupo.get(j).addEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED, guardar_caracteres_respuesta)
        lista_respuestas_grupo.get(j).addEventListener(gapi.drive.realtime.EventType.TEXT_DELETED, guardar_caracteres_respuesta)
    }
}

function lista_preguntas_cambiada(evt) {
    var div_examen = document.getElementById("div_examen")
    
    if (evt.type == "values_added") {
        var div = document.createElement("div")
        
        cargar_textarea(lista_preguntas.get(evt.index), div, "Pregunta " + (evt.index + 1), "p")
        cargar_textarea(lista_respuestas_grupo.get(evt.index), div, "Respuesta " + (evt.index + 1), "r")
        lista_respuestas_grupo.get(evt.index).addEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED, guardar_caracteres_respuesta)
        lista_respuestas_grupo.get(evt.index).addEventListener(gapi.drive.realtime.EventType.TEXT_DELETED, guardar_caracteres_respuesta)
        div_examen.appendChild(div)        
    } else {
        div_examen.removeChild(div_examen.lastChild)
    }
}

function guardar_caracteres_respuesta(evt) {
    if (evt.isLocal == true) {
        var caracter = {
            "texto" : evt.text,
            "correo" : alumno.correo,
            "nombre_grupo" : grupo.nombre_grupo,
            "color" : alumno.color,
            "type" : evt.type,
            "id_respuesta" : evt.target.id,
            "indice" : evt.index,
            "posicion_respuesta" : 0
        }
    
        //var lista_respuestas_grupo = cargar_objeto_colaborativo(documento, "lista_respuestas_grupo_" + grupo.nombre_grupo)
        caracter.posicion_respuesta = dame_posicion_respuesta(lista_respuestas_grupo, evt.target.id, caracter.correo)
        lista_caracteres.push(caracter)
        console.log(lista_caracteres.get(lista_caracteres.length - 1))
    }
}

function dame_posicion_respuesta (lista_respuestas_grupo, id_respuesta, correo) {
    for (var i = 0; i < lista_respuestas_grupo.length; i++) {
        for (var j = 0; j < lista_grupos.length; j++) {
            var miembros = lista_grupos.get(j).miembros

            for (var k = 0; k < miembros.length; k++) {
                if ((id_respuesta == lista_respuestas_grupo.get(i).id) && miembros[k].correo == correo) {
                    return i
                } 
            } 
        }
    }

    return -1
}

