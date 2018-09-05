var id_documento
var lista_colores = ["#228B22", "#8E2323", "#FF8C00", "#68228B"]

function autorizar() {
    realtimeUtils.authorize(function(response){
        if (response.error) {
            iniciar_sesion()     
        } else {
            crear_examen()
        }
    }, false);
}

function iniciar_sesion() {
    realtimeUtils.authorize(function(response){
        crear_examen()
    }, true);
}

function crear_examen() {
    realtimeUtils.createRealtimeFile(nombre_examen, function(createResponse) {
        //createResponse.error
        id_documento = createResponse.id
        realtimeUtils.load(id_documento, onFileLoaded, onFileInitialize)
    })
}

function onFileInitialize(modelo) {
    crear_lista_colaborativa(modelo, "lista_preguntas")
    crear_lista_colaborativa(modelo, "lista_grupos")
    crear_lista_colaborativa(modelo, "lista_caracteres")
    crear_lista_colaborativa(modelo, "lista_colaboradores")
    crear_string_colaborativo(modelo, "string_examen_activado")
    crear_string_colaborativo(modelo, "string_examen_activado_primera_vez")
    for (var i = 0; i < alumnos.length; i++) {
        crear_string_colaborativo(modelo, 'string_nota_' + alumnos[i].email)
    }
}

var documento

function onFileLoaded(doc) {
    documento = doc
    var modelo = documento.getModel()
    inicializar_string_colaborativo(modelo, "string_examen_activado")
    inicializar_string_colaborativo(modelo, "string_examen_activado_primera_vez")
    insertar_colaboradores(documento)
    permisos_profesores()
}

function inicializar_string_colaborativo (modelo, nombre) {
    var string_colaborativo = cargar_objeto_colaborativo(documento, nombre) 
    string_colaborativo.setText("0")
}

function insertar_colaboradores(documento) {
    var i_color = 0;
    var lista_colaboradores = cargar_objeto_colaborativo(documento, "lista_colaboradores")

    if (lista_colaboradores.length == 0) {
        for (var i = 0; i < profesores.length; i++) {
            var colaborador = {
                "nombre": profesores[i].firstname,
                "apellidos": profesores[i].lastname,
                "correo": profesores[i].email,
                "color": lista_colores[i_color],
                "permissionId": "",
                "rol": "profesor"
            }

            i_color++
            lista_colaboradores.push(colaborador)
        }

        for (var i = 0; i < alumnos.length; i++) {
            var colaborador = {
                "nombre": alumnos[i].firstname,
                "apellidos": alumnos[i].lastname,
                "correo": alumnos[i].email,
                "color": lista_colores[i_color],
                "permissionId": "",
                "rol": "alumno"
            }

            i_color++
            lista_colaboradores.push(colaborador)
        }
    }
}

function permisos_profesores() {
    var id_intervalo = 0
    var i = 0
	var correo = ''
    //Tengo que comprobar que no se invite al profesor que ha creado el examen
    id_intervalo = setInterval (function() {
        console.log(i)
        if (i >= profesores.length) {
            clearInterval(id_intervalo)
            conseguir_permissionId_de_los_colaboradores_profesores()
        } else {
            correo = profesores[i].email
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
        }
        i += 1
    }, 1000);
}

function conseguir_permissionId_de_los_colaboradores_profesores() {
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

            if (colaborador.correo == lista[j].emailAddress) {
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
    form.setAttribute("action","nuevo_examen.php")
    form.setAttribute("style", "display:none")

    //El id de la vista
    var input_id = document.createElement("input")
    input_id.setAttribute("name", "id")
    input_id.setAttribute("type", "hidden")
    input_id.setAttribute("value",  id)

    //El id del documento
    var input_id_documento = document.createElement("input")
    input_id_documento.setAttribute("name", "id_documento")
    input_id_documento.setAttribute("type", "hidden")
    input_id_documento.setAttribute("value", id_documento)

    var input_submit = document.createElement("input")
    input_submit.setAttribute("type", "submit")
    input_submit.setAttribute("value", "Crear examen")

    form.appendChild(input_id)
    form.appendChild(input_id_documento)
    form.appendChild(input_submit)

    div_formulario.innerHTML = ''
    div_formulario.appendChild(form)

    form.submit()
}