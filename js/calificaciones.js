function autorizar() {
    realtimeUtils.authorize(function (response) {
        if (response.error) {
            iniciar_sesion()
        } else {
            realtimeUtils.load(id_documento, onFileLoaded, onFileInitialize)
        }
    }, false);
}

function iniciar_sesion() {
    realtimeUtils.authorize(function (response) {
        realtimeUtils.load(idDocumento, onFileLoaded, onFileInitialize)
    }, true);
}

var documento
var lista_grupos
var lista_preguntas
var lista_caracteres
var lista_colaboradores

function onFileInitialize(model) { }

function onFileLoaded(doc) {
    documento = doc

    lista_grupos = cargar_objeto_colaborativo(documento, 'lista_grupos')
    lista_preguntas = cargar_objeto_colaborativo(documento, 'lista_preguntas')
    lista_caracteres = cargar_objeto_colaborativo(documento, 'lista_caracteres')
    lista_colaboradores = cargar_objeto_colaborativo(documento, 'lista_colaboradores')

    lateral_colaboradores()
    cargar_notas_colaborativas_formulario()
    cargar_respuestas_caracteres_colores()
    //eventos()
}

function cargar_notas_colaborativas_formulario() {
    for (var i = 0; i < alumnos.length; i++) {
        for (var j = 0; j < lista_grupos.length; j++) {
            var miembros = lista_grupos.get(j).miembros
            for (var k = 0; k < miembros.length; k++) {
                if (miembros[k].correo == alumnos[i].email) {
                    var string_colaborativo = cargar_objeto_colaborativo(documento, 'string_nota_' + alumnos[i].email)

                    var textarea = document.getElementById("textarea" + alumnos[i].email)
                    gapi.drive.realtime.databinding.bindString(string_colaborativo, textarea)

                }
            }
        }
    }
}

function cargar_respuestas_caracteres_colores() {
    var div_estadisticas = document.getElementById("div_estadisticas")
    //var num_alumnos = dame_numero_de_alumnos()
    for (var i = 0; i < lista_preguntas.length; i++) {
        cargar_pregunta(i, div_estadisticas)
        for (var j = 0; j < lista_grupos.length; j++) {
            //cargar_respuesta_grupo(i, j, div_estadisticas)
            cargar_caracteres_respuesta_grupo(i, j, div_estadisticas)
            //cargar_grafica_grupo(i, j, div_estadisticas, num_alumnos)
        }
    }
}

function dame_numero_de_alumnos() {
    var num_alumnos = 0
    for (var i = 0; i < lista_grupos.length; i++) {
        var miembros = lista_grupos.get(i).miembros

        num_alumnos += miembros.length
    }

    return num_alumnos
}

function cargar_pregunta(i, div) {
    var h4 = document.createElement("h4")
    h4.innerHTML = "Pregunta " + (i + 1)

    var p = document.createElement("p")
    p.style = "border-style:solid; height:100px; overflow-y:auto;"
    p.innerText = lista_preguntas.get(i).getText()

    div.appendChild(h4)
    div.appendChild(p)
}

function cargar_caracteres_respuesta_grupo(i, j, div) {
    var grupo = lista_grupos.get(j)
    var lista_respuestas_grupo = cargar_objeto_colaborativo(documento, "lista_respuestas_grupo_" + grupo.nombre_grupo)
    var h4 = document.createElement("h4")
    h4.innerHTML = "Respuesta " + (i + 1) + " - " + grupo.nombre_grupo
    div.appendChild(h4)
    var string_respuesta_id = lista_respuestas_grupo.get(i).id

    var div_caracteres = document.createElement("div")
    div_caracteres.style = "border-style:solid; height:100px; overflow-y:auto;"
    div.appendChild(div_caracteres)
    console.log(lista_caracteres.length)

    for (var k = 0; k < lista_caracteres.length; k++) {
        var caracter = lista_caracteres.get(k)

        //console.log(caracter)

        if ((caracter != null) && (caracter.id_respuesta == string_respuesta_id)) {
            //console.log("id1: " + caracter.id_respuesta)
            //console.log("id2: " + string_respuesta_id)
            for (var x = 0; x < caracter.texto.length; x++) {
                var nodes = div_caracteres.childNodes
                var indice = caracter.indice + x
                
                for (var y = 0; y <= nodes.length; y++) {
                    if (caracter.type == "text_inserted") {
                        var salir = false
                        var span = document.createElement("span")
                        span.innerHTML = caracter.texto[x]
                        if (span.innerHTML == " ") {
                            span.style = "background-color : " + caracter.color + ";"
                        } else {
                            span.style = "color : " + caracter.color + ";"
                        }
                        //console.log("index: " + indice + " nodes.length: " + nodes.length + " y: " + y)
                        if ((indice == y) && (indice == nodes.length)) {
                            console.log("c1: " + span.innerHTML)
                            console.log("length " + nodes.length)
                            div_caracteres.appendChild(span)
                            salir = true
                            break
                        } else if ((indice == 0) && (y == 0)) {
                            console.log("c2: " + span.innerHTML)
                            console.log("length " + nodes.length)
                            div_caracteres.insertBefore(span, nodes[indice])
                            salir = true
                            break
                        } else if (indice == y) {
                            console.log("c3: " + span.innerHTML)
                            console.log("length " + nodes.length)
                            div_caracteres.insertBefore(span, nodes[indice])
                            salir = true
                            break
                        }

                        if (salir) {
                            break
                        }
                    } else {
                        var salir = false
                        console.log("y: " + y + " nodes.length: " + nodes.length)
                        if (caracter.texto[x] == nodes[y].innerHTML) {
                            console.log("cb: " + caracter.texto[x])
                            console.log("length " + nodes.length)
                            div_caracteres.removeChild(nodes[y])
                            salir = true
                            break
                        }

                        if (salir) {
                            break
                        }
                    }
                }
            }
        }
    }
}