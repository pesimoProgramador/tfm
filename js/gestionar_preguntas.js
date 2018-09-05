function habilitar_deshabilitar_botones(valor) {
    if (valor == true) {
        document.getElementById("button_crear_pregunta").disabled = true
        document.getElementById("button_borrar_pregunta").disabled = true
    } else {
        document.getElementById("button_crear_pregunta").disabled = false
        document.getElementById("button_borrar_pregunta").disabled = false
    }
}

function autorizar() {
    realtimeUtils.authorize(function(response){
        if (response.error) {
            iniciar_sesion()     
        } else {
            //realtimeUtils.getUser(user)
            realtimeUtils.load(id_documento, onFileLoaded, onFileInitialize)
        }
    }, false);
}

function iniciar_sesion() {
    realtimeUtils.authorize(function(response){
        //realtimeUtils.getUser(user)
        realtimeUtils.load(id_documento, onFileLoaded, onFileInitialize)
    }, true);
}

function onFileInitialize(model) {

}

var documento
var modelo
var lista_preguntas
var string_examen_activado_primera_vez
var lista_grupos
var lista_caracteres

function onFileLoaded(doc) {
    documento = doc
    modelo = documento.getModel()

    lista_preguntas = cargar_objeto_colaborativo(documento, "lista_preguntas")
    string_examen_activado_primera_vez = cargar_objeto_colaborativo(documento, "string_examen_activado_primera_vez")
    lista_grupos = cargar_objeto_colaborativo(documento, "lista_grupos")
    lista_caracteres = cargar_objeto_colaborativo(documento, "lista_caracteres")
    lista_colaboradores = cargar_objeto_colaborativo(documento, "lista_colaboradores")

    lateral_colaboradores()
    cargar_preguntas(documento, lista_preguntas)
    eventos()
    habilitar_deshabilitar_botones(false)
}

function cargar_preguntas() {
    var div_examen = document.getElementById("div_examen") 

    for (var i = 1; i <= lista_preguntas.length; i++) {
        var div = document.createElement("div")

        var h2 = document.createElement("h2")
        h2.innerHTML = "Pregunta " + i

        var textarea = document.createElement("textarea")
        textarea.className = "textarea_preguntas"

        var string_pregunta = lista_preguntas.get(i-1)
        gapi.drive.realtime.databinding.bindString(string_pregunta, textarea)

        div.appendChild(h2)
        div.appendChild(textarea)
        div_examen.appendChild(div)
    }
}

function eventos() {
    documento.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_JOINED, colaboradores)
    documento.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_LEFT, colaboradores)
    lista_preguntas.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, lista_preguntas_cambiada)
    lista_preguntas.addEventListener(gapi.drive.realtime.EventType.VALUES_REMOVED, lista_preguntas_cambiada)
}

//function colaboradores(evt) {
//    var colaborador

//    for (var i = 0; i < lista_colaboradores.length; i++) {
//        colaborador = lista_colaboradores.get(i)

//        if (evt.collaborator.permissionId == colaborador.permissionId) {
//            break
//        }
//    }

//    if (colaborador.rol == "profesor") {
//        var div_profesores = document.getElementById("div_profesores")

//        for (var i = 0; i < div_profesores.childNodes.length; i++) {
//            var p = div_profesores.childNodes[i]

//            if (p.innerHTML == colaborador.correo) {
//                if (evt.type == "collaborator_joined") {
//                    p.style.color = colaborador.color
//                } else {
//                    p.style.color = "black"
//                }
                
//                break
//            }
//        }
//    } else {
//        var nombre_grupo
//        var esta_colaborador_en_grupo = false

//        for (var i = 0; i < lista_grupos.length; i++) {
//            var grupo = lista_grupos.get(i)
//            nombre_grupo = grupo.nombre_grupo

//            for (var j = 0; j < grupo.miembros.length; j++) {
//                if (colaborador.correo == grupo.miembros[j].correo) {
//                    esta_colaborador_en_grupo = true
//                    break
//                }
//            }

//            if (esta_colaborador_en_grupo) {
//                break
//            }
//        }

//        var div_grupo = document.getElementById("div_grupo_" + nombre_grupo)

//        for (var i = 0; i < div_grupo.childNodes.length; i++) {
//            var p = div_grupo.childNodes[i]

//            if (p.innerHTML == colaborador.correo) {
//                if (evt.type == "collaborator_joined") {
//                    p.style.color = colaborador.color
//                } else {
//                    p.style.color = "black"
//                }
//            }
//        }
//    }


//    if (evt.type == "collaborator_joined") {
//        if (colaborador.rol == "profesor") {
//            var div_profesores = document.getElementById("div_profesores")

//            for (var i = 0; i < div_profesores.childNodes.length; i++) {
//                var p = div_profesores.childNodes[i]

//                if (p.innerHTML == colaborador.correo) {
//                    p.style.color = colaborador.color

//                    break
//                }
//            }
//        } else {
//            var nombre_grupo
//            var esta_colaborador_en_grupo = false

//            for (var i = 0; i < lista_grupos.length; i++) {
//                var grupo = lista_grupos.get(i)
//                nombre_grupo = grupo.nombre_grupo

//                for (var j = 0; j < grupo.miembros.length; j++) {
//                    if (colaborador.correo == grupo.miembros[j].correo) {
//                        esta_colaborador_en_grupo = true
//                        break
//                    }
//                }

//                if (esta_colaborador_en_grupo) {
//                    break
//                }
//            }

//            var div_grupo = document.getElementById("div_grupo_" + nombre_grupo)

//            for (var i = 0; i < div_grupo.childNodes.length; i++) {
//                var p = div_grupo.childNodes[i]

//                if (p.innerHTML == colaborador.correo) {
//                    p.style.color = colaborador.color
//                }
//            }
//        }
//    } else { //"collaborator_left"
//        if (colaborador.rol == "profesor") {
//            var div = document.getElementById("divProfesores")
//        } else {
//            var nombreGrupo
//            var existeAlumno = false

//            for (var i = 0; i < listaGrupos.length; i++) {
//                nombreGrupo = listaGrupos.get(i).nombreGrupo
//                var miembros = listaGrupos.get(i).miembros

//                for (var j = 0; j < miembros.length; j++) {
//                    var alumno = miembros[j]

//                    if (alumno.correo == colaborador.correo) {
//                        existeAlumno = true
//                        break
//                    }
//                }

//                if (existeAlumno) {
//                    break
//                }
//            }

//            var div = document.getElementById("div" + nombreGrupo)
//        }

//        for (var i = 0; i < div.childNodes.length; i++) {
//            if (div.childNodes[i].innerHTML == colaborador.correo) {
//                div.childNodes[i].style.color = "black"
//                break
//            }
//        }
//    }
//}

function lista_preguntas_cambiada(evt) {
    var div_examen = document.getElementById("div_examen")
    
    if (evt.type == "values_added") {
        var div = document.createElement("div")
        var h2 = document.createElement("h2")
        h2.innerHTML = "Pregunta " + (evt.index + 1)

        var textarea = document.createElement("textarea")
        textarea.className = "textarea_preguntas"

        div.appendChild(h2)
        div.appendChild(textarea)
        div_examen.appendChild(div)
        gapi.drive.realtime.databinding.bindString(lista_preguntas.get(evt.index), textarea)
    } else {
        div_examen.removeChild(div_examen.lastChild)
    }
}


function button_crear_pregunta() {
    if (string_examen_activado_primera_vez.getText() == "1") {
        for (var i = 0; i < lista_grupos.length; i++) {
            var nombre_grupo = lista_grupos.get(i).nombre_grupo
            var lista_respuestas_grupo = cargar_objeto_colaborativo(documento, "lista_respuestas_grupo_" + nombre_grupo)
            var string_respuesta = modelo.createString()

            lista_respuestas_grupo.push(string_respuesta)
        }
    }

    var string_pregunta = modelo.createString()
    lista_preguntas.push(string_pregunta)
}

function button_borrar_pregunta() {
    //lista_caracteres.clear()
    if (lista_preguntas.length > 0) {
        if (string_examen_activado_primera_vez.getText() == "1") {
            for (var i = 0; i < lista_grupos.length; i++) {
                console.log(i)
                var nombre_grupo = lista_grupos.get(i).nombre_grupo
                console.log(nombre_grupo)
                //lista_preguntas.clear()
                var lista_respuestas_grupo = cargar_objeto_colaborativo(documento, "lista_respuestas_grupo_" + nombre_grupo)
                console.log(lista_preguntas.length)
                console.log(lista_respuestas_grupo.length)
                //lista_respuestas_grupo.clear()
                id_string_respuesta = lista_respuestas_grupo.get(lista_respuestas_grupo.length - 1).id
                console.log(id_string_respuesta)

                for (var j = 0; j < lista_caracteres.length; j++) {
                    var caracter = lista_caracteres.get(j)
                    console.log(caracter)
                    if (id_string_respuesta == caracter.id_respuesta) {
                        lista_caracteres.remove(j)
                    }
                }

                for (var j = 0; j < lista_caracteres.length; j++) {
                    console.log(lista_caracteres.get(j))
                }

                lista_respuestas_grupo.remove(lista_respuestas_grupo.length - 1)
            }
        }
        //lista_caracteres.remove()

        lista_preguntas.remove(lista_preguntas.length - 1)
    }
}