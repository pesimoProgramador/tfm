function crear_string_colaborativo(modelo, nombre) {
    var string_colaborativo = modelo.createString()
    modelo.getRoot().set(nombre, string_colaborativo)
}

function crear_lista_colaborativa(modelo, nombre) {
	var lista_colaborativa = modelo.createList()
    modelo.getRoot().set(nombre, lista_colaborativa)
}

function cargar_objeto_colaborativo(documento, nombre) {
    return documento.getModel().getRoot().get(nombre)
}

function lateral_colaboradores() {
    var aside = document.getElementById("block-region-side-pre")

    var div_navigation = document.createElement("div")
    div_navigation.setAttribute("class", "block_navigation block")

    var div_header = document.createElement("div")
    div_header.setAttribute("class", "header")

    var h2_titulo = document.createElement("h2")
    h2_titulo.innerHTML = "Colaboradores"

    var div_content = document.createElement("div")
    div_content.setAttribute("class", "content")

    div_header.appendChild(h2_titulo)
    div_navigation.appendChild(div_header)
    div_navigation.appendChild(div_content)

    aside.insertBefore(div_navigation, aside.childNodes[0])

    //Profesores

    var h3_profesor = document.createElement("h3")
    h3_profesor.innerHTML = "Profesores"

    var div_profesores = document.createElement("div")
    div_profesores.id = "div_profesores"

    div_content.appendChild(h3_profesor)
    div_content.appendChild(div_profesores)

    for (var i = 0; i < lista_colaboradores.length; i++) {
        if (lista_colaboradores.get(i).rol == "profesor") {
            var p_profesor = document.createElement("p")
            p_profesor.innerHTML = lista_colaboradores.get(i).correo

            div_profesores.appendChild(p_profesor)
        }
    }

    //Grupos

    for (var i = 0; i < lista_grupos.length; i++) {
        var grupo = lista_grupos.get(i)

        var h3_grupo = document.createElement("h3")
        h3_grupo.innerHTML = grupo.nombre_grupo

        var div_grupo = document.createElement("div")
        div_grupo.id = "div_grupo_" + grupo.nombre_grupo

        div_content.appendChild(h3_grupo)
        div_content.appendChild(div_grupo)

        var miembros = grupo.miembros

        for (var j = 0; j < miembros.length; j++) {
            var p_alumno = document.createElement("p")
            p_alumno.innerHTML = miembros[j].correo

            div_grupo.appendChild(p_alumno)
        }
    }
}

function colaboradores(evt) {
    var colaborador

    for (var i = 0; i < lista_colaboradores.length; i++) {
        colaborador = lista_colaboradores.get(i)

        if (evt.collaborator.permissionId == colaborador.permissionId) {
            break
        }
    }

    console.log("Colaborador")
    console.log(colaborador)

    if (colaborador.rol == "profesor") {
        var div_profesores = document.getElementById("div_profesores")

        for (var i = 0; i < div_profesores.childNodes.length; i++) {
            var p = div_profesores.childNodes[i]

            if (p.innerHTML == colaborador.correo) {
                if (evt.type == "collaborator_joined") {
                    p.style.color = colaborador.color
                } else {
                    p.style.color = "black"
                }

                break
            }
        }
    } else {
        var nombre_grupo
        var esta_colaborador_en_grupo = false

        for (var i = 0; i < lista_grupos.length; i++) {
            var grupo = lista_grupos.get(i)
            nombre_grupo = grupo.nombre_grupo

            for (var j = 0; j < grupo.miembros.length; j++) {
                if (colaborador.correo == grupo.miembros[j].correo) {
                    esta_colaborador_en_grupo = true
                    break
                }
            }

            if (esta_colaborador_en_grupo) {
                break
            }
        }

        var div_grupo = document.getElementById("div_grupo_" + nombre_grupo)

        for (var i = 0; i < div_grupo.childNodes.length; i++) {
            var p = div_grupo.childNodes[i]

            if (p.innerHTML == colaborador.correo) {
                if (evt.type == "collaborator_joined") {
                    p.style.color = colaborador.color
                } else {
                    p.style.color = "black"
                }
            }
        }
    }
}