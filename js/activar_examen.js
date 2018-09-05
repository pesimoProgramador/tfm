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

function onFileInitialize(modelo) {
	
}

var documento
var string_examen_activado
var string_examen_activado_primera_vez
var lista_grupos
var lista_preguntas

function onFileLoaded(doc) {
    documento = doc
    var modelo = documento.getModel()
    string_examen_activado = cargar_objeto_colaborativo(documento, 'string_examen_activado')
    string_examen_activado_primera_vez = cargar_objeto_colaborativo(documento, 'string_examen_activado_primera_vez')
    lista_preguntas = cargar_objeto_colaborativo(documento, 'lista_preguntas')
	lista_grupos = cargar_objeto_colaborativo(documento, 'lista_grupos')
    
    if (string_examen_activado_primera_vez.getText() == "0") {
        if (lista_grupos.length == 0) {
        console.log("0")
            crear_grupo_con_todos_los_alumnos(documento)
        }
        crear_listas_respuestas_grupos(documento, modelo)
        crear_respuestas_grupos(documento, modelo)
        string_examen_activado_primera_vez.setText("1")
    }

    string_examen_activado.setText("1")
	permisos()
}

function crear_grupo_con_todos_los_alumnos(documento) {
    var lista_colaboradores = cargar_objeto_colaborativo(documento, 'lista_colaboradores')

    var grupo = {
        "nombre_grupo" : "Todos los alumnos",
        "miembros" : []
    }

    for (var i = 0; i < lista_colaboradores.length; i++) {
        var colaborador = lista_colaboradores.get(i)

        if (colaborador.rol == "alumno") {
            grupo.miembros.push(colaborador)
        }
    }

    lista_grupos.push(grupo)
}

function crear_listas_respuestas_grupos(documento, modelo) {
    for (var i = 0; i < lista_grupos.length; i++) {
        var nombre_grupo = lista_grupos.get(i).nombre_grupo
        var lista_respuestas_grupo = crear_lista_colaborativa(modelo, "lista_respuestas_grupo_" + nombre_grupo)
        console.log("lista_respuestas_grupo_" + nombre_grupo)
    }
}

function crear_respuestas_grupos(documento, modelo) {
    for (var j = 0; j < lista_grupos.length; j++) {
        for (var i = 0; i < lista_preguntas.length; i++) {
            console.log(lista_grupos.get(j).nombre_grupo)
            var lista_respuestas_grupo = cargar_objeto_colaborativo(documento, "lista_respuestas_grupo_" + lista_grupos.get(j).nombre_grupo)
            var string_respuesta = modelo.createString()
            lista_respuestas_grupo.push(string_respuesta)
        }
    }
}

function permisos() {
    //Con un for no funciona.
    var id_intervalo = 0
    var i = 0
    var j = 0
	var correo = ''
    var num_grupos = lista_grupos.length
    id_intervalo = setInterval (function() {
        if (i >= num_grupos) {
            clearInterval(id_intervalo)
            conseguir_permissionId_de_los_colaboradores_alumnos()
        } else {
            var longitud_lista_miembros = lista_grupos.get(i).miembros.length

            if (longitud_lista_miembros > 0) {
                if (j < longitud_lista_miembros) {
                    correo = lista_grupos.get(i).miembros[j].correo
                    console.log(correo)
                    window.gapi.client.load('drive', 'v2', function() {
                        var body = {
                            'value': correo,
                            'type': 'user',
                            'role': 'writer'
                        }

                        window.gapi.client.drive.permissions.insert({
                            'fileId': id_documento,
                            'resource': body
                        }).execute()
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

function conseguir_permissionId_de_los_colaboradores_alumnos() {
    console.log(id_documento)
    realtimeUtils.getListPermissionId(id_documento, guardar_permissionId)
}

function guardar_permissionId(resp) {
    var lista_colaboradores = cargar_objeto_colaborativo(documento, "lista_colaboradores")
    var lista = resp.items

    for (var i = 0; i < lista.length; i++) {
        console.log(lista[i])
    }

    for (var i = 0; i < lista_colaboradores.length; i++) {
        for (var j = 0; j < lista.length; j++) {
            var colaborador = lista_colaboradores.get(i)

            if ((colaborador.correo == lista[j].emailAddress) && (colaborador.rol == "alumno")) {
                var temp = {
                    "nombre" : colaborador.nombre,
                    "apellidos" : colaborador.apellidos,
                    "correo" : colaborador.correo,
                    "color" : colaborador.color,
                    "permissionId" : lista[j].id,
                    "rol" : colaborador.rol
                }

                lista_colaboradores.set(i, temp)
            }
        }
    }

    for (var i = 0; i < lista_colaboradores.length; i++) {
        console.log(lista_colaboradores.get(i))
    }

    formulario()
}

function formulario() {
    var div_formulario = document.getElementById("div_formulario")
	
    var form = document.createElement("form")
    form.setAttribute("method","get")
    form.setAttribute("action","activar_examen.php")
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

    var input_examen_activado_primera_vez = document.createElement("input")
    input_examen_activado_primera_vez.setAttribute("name", "examen_activado_primera_vez")
    input_examen_activado_primera_vez.setAttribute("type", "hidden")
    input_examen_activado_primera_vez.setAttribute("value", parseInt(string_examen_activado_primera_vez.getText()))

    var input_submit = document.createElement("input")
    input_submit.setAttribute("type", "submit")
    input_submit.setAttribute("value", "Activar examen")

    form.appendChild(input_id)
    form.appendChild(input_examen_activado)
    form.appendChild(input_examen_activado_primera_vez)
    form.appendChild(input_submit)

    div_formulario.innerHTML = ''
    div_formulario.appendChild(form)

    form.submit()
}