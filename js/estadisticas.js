function autorizar() {
    realtimeUtils.authorize(function (response) {
        if (response.error) {
            iniciar_sesion()
        } else {
            estadisticas()
        }
    }, false);
}

function iniciar_sesion() {
    realtimeUtils.authorize(function (response) {
        estadisticas()
    }, true);
}

function estadisticas() {
    recuperar_datos_examenes()
}

var datos_estadisticas = []

function recuperar_datos_examenes() {
    var id_intervalo = 0
    var i = 0
    id_intervalo = setInterval(function () {
        if (i >= actividades.length) {
            console.log("intervalo: " + i)
            clearInterval(id_intervalo)
        } else {
            var id_documento = actividades[i].id_documento
            var nombre_examen = actividades[i].name
            //console.log(id_documento)
            realtimeUtils.load(id_documento, function (documento) {
                // console.log(idDocumento)
                var examen = {
                    "id_documento": id_documento,
                    "nombre_examen": nombre_examen,
                    "num_palabras": 0,
                    "num_caracteres_escritos": 0,
                    "num_caracteres_borrados": 0,
                    "num_caracteres_escritos_respuestas": [],
                    "num_caracteres_borrados_respuestas": [],
                    "lista_preguntas": [],
                    "lista_grupos": [],
                    "lista_caracteres": []
                }

                guardar_preguntas(examen.lista_preguntas, documento)
                guardar_caracteres(examen.lista_caracteres, documento)
                guardar_datos_grupos(examen.lista_grupos, documento)
                datos_estadisticas.push(examen)
                
                if (datos_estadisticas.length == actividades.length) {
                    //console.log(datos_estadisticas)
                    contar_caracteres(datos_estadisticas)
                    contar_palabras(datos_estadisticas)
                    console.log(datos_estadisticas)
                    mostrar_estadisticas(datos_estadisticas)
                }
            }, onFileInitialize)
            i++
        }
    }, 1000)
}

function onFileInitialize(modelo) { }

function guardar_preguntas(lista, documento) {
    var lista_preguntas = cargar_objeto_colaborativo(documento, "lista_preguntas")

    for (var i = 0; i < lista_preguntas.length; i++) {
        var pregunta = lista_preguntas.get(i).getText()
        console.log(pregunta)
        lista.push(pregunta)
    }
}

function guardar_caracteres(lista, documento) {
    lista_caracteres = cargar_objeto_colaborativo(documento, 'lista_caracteres')

    for (var i = 0; i < lista_caracteres.length; i++) {
        var caracter = {
            "texto": lista_caracteres.get(i).texto,
            "correo": lista_caracteres.get(i).correo,
            "nombre_grupo": lista_caracteres.get(i).nombre_grupo,
            "color": lista_caracteres.get(i).color,
            "type": lista_caracteres.get(i).type,
            "id_respuesta": lista_caracteres.get(i).id_respuesta,
            "indice": lista_caracteres.get(i).indice,
            "posicion_respuesta": lista_caracteres.get(i).posicion_respuesta
        }

        lista.push(caracter)
    }
}

function guardar_datos_grupos(lista, documento) {
    var lista_grupos = cargar_objeto_colaborativo(documento, 'lista_grupos')

    for (var i = 0; i < lista_grupos.length; i++) {
        var grupo = {
            "nombre_grupo": lista_grupos.get(i).nombre_grupo,
            "num_palabras": 0,
            "num_caracteres_escritos": 0,
            "num_caracteres_borrados": 0,
            "miembros": [],
            "lista_respuestas": [],
            "num_palabras_respuestas": [],
            "num_caracteres_escritos_respuestas": [],
            "num_caracteres_borrados_respuestas": []
        }
        var miembros = lista_grupos.get(i).miembros

        for (var j = 0; j < miembros.length; j++) {
            var alumno = {
                "nombre": miembros[j].nombre,
                "apellidos": miembros[j].apellidos,
                "correo": miembros[j].correo,
                "num_caracteres_escritos": 0,
                "num_caracteres_borrados": 0,
                "num_caracteres_escritos_respuestas": [],
                "num_caracteres_borrados_respuestas": []
            }

            grupo.miembros.push(alumno)
        }

        guardar_respuestas(grupo, documento)

        lista.push(grupo)
    }
}

function guardar_respuestas(grupo, documento) {
    var lista = grupo.lista_respuestas
    var lista_respuestas_grupo = cargar_objeto_colaborativo(documento, "lista_respuestas_grupo_" + grupo.nombre_grupo)

    for (var i = 0; i < lista_respuestas_grupo.length; i++) {
        lista.push(lista_respuestas_grupo.get(i).getText())
    }
}

function contar_caracteres(datos) {
    for (var i = 0; i < datos.length; i++) {
        contar_caracteres_respuestas_alumnos(datos[i].lista_caracteres, datos[i].lista_grupos)
        contar_caracteres_respuestas_grupos(datos[i].lista_grupos, datos[i].lista_preguntas.length)
        contar_caracteres_grupos(datos[i].lista_grupos, datos[i].lista_preguntas.length)
        contar_caracteres_respuestas_examen(datos[i])
    }
}

function contar_caracteres_respuestas_alumnos(lista_caracteres, grupos) {
    for (var i = 0; i < grupos.length; i++) {
        var miembros = grupos[i].miembros

        for (var j = 0; j < miembros.length; j++) {
            var num_caracteres_escritos_respuestas = miembros[j].num_caracteres_escritos_respuestas
            var num_caracteres_borrados_respuestas = miembros[j].num_caracteres_borrados_respuestas
            //console.log(lista_caracteres.length)
            for (var k = 0; k < lista_caracteres.length; k++) {
                num_caracteres_escritos_respuestas[k] = 0
                num_caracteres_borrados_respuestas[k] = 0

                var caracter = lista_caracteres[k]
                //console.log(caracter)

                if (caracter.correo == miembros[j].correo) {
                    if (caracter.type == "text_inserted") {
                        num_caracteres_escritos_respuestas[caracter.posicion_respuesta] += caracter.texto.length
                        //console.log(num_caracteres_escritos_respuestas[caracter.posicion_respuesta])
                        miembros[j].num_caracteres_escritos += caracter.texto.length
                    } else { //caracter.type == "text_deleted"
                        num_caracteres_borrados_respuestas[caracter.posicion_respuesta] += caracter.texto.length
                        miembros[j].num_caracteres_borrados += caracter.texto.length
                    }
                }
            }
        }
    }
}

function contar_caracteres_respuestas_grupos(grupos, num_respuestas) {
    var miembros = grupos.miembros
    console.log("r: " + num_respuestas)

    for (var i = 0; i < num_respuestas; i++) {
        for (var j = 0; j < grupos.length; j++) {
            var grupo = grupos[j]
            var miembros = grupo.miembros

            grupo.num_caracteres_escritos_respuestas[i] = 0
            //console.log("e: " + grupo.num_caracteres_escritos_respuestas.length)
            grupo.num_caracteres_borrados_respuestas[i] = 0

            for (var k = 0; k < miembros.length; k++) {
                grupo.num_caracteres_escritos_respuestas[i] += miembros[k].num_caracteres_escritos_respuestas[i]
                //grupo.num_caracteres_escritos += miembros[k].num_caracteres_escritos_respuestas
                grupo.num_caracteres_borrados_respuestas[i] += miembros[k].num_caracteres_borrados_respuestas[i]
                //grupo.num_caracteres_borrados += miembros[k].num_caracteres_borrados_respuestas
            }
        }
    }
}

function contar_caracteres_grupos(grupos, num_respuestas) {
    for (var i = 0; i < grupos.length; i++) {
        var grupo = grupos[i]

        grupo.num_caracteres_escritos = 0
        grupo.num_caracteres_borrados = 0

        for (var j = 0; j < num_respuestas; j++) {
            grupo.num_caracteres_escritos += grupo.num_caracteres_escritos_respuestas[j]
            grupo.num_caracteres_borrados += grupo.num_caracteres_borrados_respuestas[j]
        }
    }
}

function contar_caracteres_respuestas_examen (datos) {
    var num_respuestas = datos.lista_preguntas.length
    var grupos = datos.lista_grupos

    for (var i = 0; i < num_respuestas; i++) {
        datos.num_caracteres_escritos_respuestas[i] = 0
        datos.num_caracteres_borrados_respuestas[i] = 0

        for (var j = 0; j < grupos.length; j++) {
            datos.num_caracteres_escritos_respuestas[i] = grupos[j].num_caracteres_escritos_respuestas[i]
            datos.num_caracteres_escritos += grupos[j].num_caracteres_escritos_respuestas[i]
            datos.num_caracteres_borrados_respuestas[i] = grupos[j].num_caracteres_borrados_respuestas[i]
            datos.num_caracteres_borrados += grupos[j].num_caracteres_borrados_respuestas[i]
        }

    }
}

function contar_palabras(datos) {
    for (var i = 0; i < datos.length; i++) {
        contar_palabras_grupos_respuestas(datos[i].lista_grupos, datos[i].lista_preguntas.length)
        contar_palabras_grupos(datos[i].lista_grupos, datos[i].lista_preguntas.length)
        contar_palabras_examen(datos[i])
    }
}

function contar_palabras_grupos_respuestas(grupos, num_respuestas) {
    for (var i = 0; i < grupos.length; i++) {
        var grupo = grupos[i]

        for (var j = 0; j < num_respuestas; j++) {
            grupo.num_palabras_respuestas[j] = num_palabras_string(grupo.lista_respuestas[j])
        }
    }
}

function contar_palabras_grupos(grupos, num_respuestas) {
    for (var i = 0; i < grupos.length; i++) {
        var grupo = grupos[i]

        for (var j = 0; j < num_respuestas; j++) {
            grupo.num_palabras += num_palabras_string(grupo.lista_respuestas[j])
        }
    }
}

function contar_palabras_examen(datos) {
    for (var i = 0; i < datos.lista_grupos.length; i++) {
        var grupo = datos.lista_grupos[i]

        datos.num_palabras += grupo.num_palabras
    }
}

function num_palabras_string(s) {
    var primer_espacio = "/^ /"
    var ultimo_espacio = "/ $/"
    var varios_espacios = "/[ ]+/g"

    var num_palabras = 0
    if (s != "") {
        s = s.replace(varios_espacios, " ");
        s = s.replace(primer_espacio, "");
        s = s.replace(ultimo_espacio, "");
        if (s != "") {
            var palabras = s.split(" ");
            num_palabras = palabras.length
        }
    }

    return num_palabras
}

function mostrar_estadisticas(datos) {
    var div_estadisticas = document.getElementById("div_estadisticas")
    grafica_examenes(datos, div_estadisticas)
    insertar_linea(div_estadisticas)

    for (var i = 0; i < datos.length; i++) {
        var nombre_examen = datos[i].nombre_examen
        console.log(nombre_examen)
        var grupos = datos[i].lista_grupos

        grafica_examen_grupos(nombre_examen, grupos, div_estadisticas)
        for (var j = 0; j < grupos.length; j++) {
            insertar_linea(div_estadisticas)
            grafica_examen_grupo_respuestas(nombre_examen, grupos[j], div_estadisticas)

            var miembros = grupos[j].miembros
            for (var k = 0; k < miembros.length; k++) {
                insertar_linea(div_estadisticas)
                grafica_examen_miembros_grupo(nombre_examen, grupos[j], div_estadisticas)
            }
        }
    }
}

function insertar_linea(div) {
    var br = document.createElement("br")
    div.appendChild(br)
}

function insertar_datos_graficas(config, nombre, num_palabras, num_caracteres_escritos, num_caracteres_borrados, i) {
    config["scale-x"].values[i] = nombre
    config.series[0].values[i] = num_palabras
    config.series[1].values[i] = num_caracteres_escritos
    config.series[2].values[i] = num_caracteres_borrados
}

function cargar_grafica(id, div_estadisticas, config) {
    var div = document.createElement("div")
    div.id = id

    div_estadisticas.appendChild(div)

    zingchart.THEME = "classic";

    zingchart.render({
        id: id,
        data: config,
        height: 500,
        width: 725
    });
}

function grafica_examenes(datos, div_estadisticas) {
    var config =
    {
        "type": "hbullet",
        "background-color": "#f4f4f4",
        "title": {
            "text": "", //Aquiiiiiiiiii
            "font-family": "arial",
            "font-size": "28px",
            "font-color": "#434F5B",
            "font-weight": "normal",
            "background-color": "none",
            "margin-top": "3%",
            "text-align": "center"
        },
        "legend": {
            "layout": "float",
            "position": "50% 12%",
            "background-color": "none",
            "border-width": "0px",
            "toggle-action": "remove",
            "item": {
                "font-family": "arial",
                "font-weight": "normal",
                "font-size": "12px",
                "font-color": "#307C70",
                "shadow": 0,
                "cursor": "hand"
            },
            "marker": {
                "cursor": "hand"
            }
        },
        "scale-y": {
            "values": "0:100:20", //Aquiiiiiiii
            "line-width": "1px",
            "line-color": "#434F5B",
            "format": "%v",
            "line-style": "solid",
            "guide": {
                "line-color": "#434F5B",
                "line-style": "solid",
                "alpha": 0.25
            },
            "tick": {
                "line-width": "1px",
                "line-color": "#434F5B"
            },
            "item": {
                "font-size": "12px",
                "font-color": "#434F5B",
                "font-weight": "normal",
                "font-family": "arial",
                "offset-y": "5%"
            }
        },
        "scale-x": { //Aquiiiiiiiii
            "values": [

            ],
            "line-color": "#434F5B",
            "line-style": "solid",
            "line-width": "1px",
            "guide": {
                "line-color": "#434F5B",
                "line-style": "solid",
                "alpha": 0.25
            },
            "tick": {
                "line-width": "1px",
                "line-color": "#434F5B"
            },
            "item": {
                "font-size": "12px",
                "font-color": "#434F5B",
                "font-weight": "normal",
                "font-family": "arial",
                "offset-x": "-5%"
            }
        },
        "plot": {
            "background-color": "#000000",
            "alpha": 1,
            "bar-space": "10px",
            "tooltip-text": "%v", //Aquiiiiiii
            "animation": {
                "effect": 4,
                "method": "0",
                "sequence": "4"
            }
        },
        "plotarea": {
            "margin": "22% 5% 15% 10%",
            "background-color": "#ffffff"
        },
        "series": [
            {
                "text": "Palabras",
                "values": [
                      
                ],
                "line-color": "#6FA3C1",
                "background-color": "#6FA3C1",
                "legend-marker": {
                    "border-color": "#6FA3C1"
                }
            },
            {
                "text": "Caracteres escritos",
                "values": [
                        
                ],
                "line-color": "#F79434",
                "background-color": "#F79434",
                "legend-marker": {
                    "border-color": "#F79434"
                }
            },
            {
                "text": "Caracteres borrados",
                "values": [
                       
                ],
                "line-color": "#7A6652",
                "background-color": "#7A6652",
                "legend-marker": {
                    "border-color": "#7A6652"
                }
            }
        ]
    };
    config.title.text = "Examenes"

    for (var i = 0; i < datos.length; i++) {
        insertar_datos_graficas(config, datos[i].nombre_examen, datos[i].num_palabras, datos[i].num_caracteres_escritos, datos[i].num_caracteres_borrados, i)
    }

    cargar_grafica("div_grafica_examenes", div_estadisticas, config)
}

function grafica_examen_grupos(nombre_examen, grupos, div_estadisticas) { 
    var config =
    {
        "type": "hbullet",
        "background-color": "#f4f4f4",
        "title": {
            "text": "", //Aquiiiiiiiiii
            "font-family": "arial",
            "font-size": "28px",
            "font-color": "#434F5B",
            "font-weight": "normal",
            "background-color": "none",
            "margin-top": "3%",
            "text-align": "center"
        },
        "legend": {
            "layout": "float",
            "position": "50% 12%",
            "background-color": "none",
            "border-width": "0px",
            "toggle-action": "remove",
            "item": {
                "font-family": "arial",
                "font-weight": "normal",
                "font-size": "12px",
                "font-color": "#307C70",
                "shadow": 0,
                "cursor": "hand"
            },
            "marker": {
                "cursor": "hand"
            }
        },
        "scale-y": {
            "values": "0:100:20", //Aquiiiiiiii
            "line-width": "1px",
            "line-color": "#434F5B",
            "format": "%v",
            "line-style": "solid",
            "guide": {
                "line-color": "#434F5B",
                "line-style": "solid",
                "alpha": 0.25
            },
            "tick": {
                "line-width": "1px",
                "line-color": "#434F5B"
            },
            "item": {
                "font-size": "12px",
                "font-color": "#434F5B",
                "font-weight": "normal",
                "font-family": "arial",
                "offset-y": "5%"
            }
        },
        "scale-x": { //Aquiiiiiiiii
            "values": [

            ],
            "line-color": "#434F5B",
            "line-style": "solid",
            "line-width": "1px",
            "guide": {
                "line-color": "#434F5B",
                "line-style": "solid",
                "alpha": 0.25
            },
            "tick": {
                "line-width": "1px",
                "line-color": "#434F5B"
            },
            "item": {
                "font-size": "12px",
                "font-color": "#434F5B",
                "font-weight": "normal",
                "font-family": "arial",
                "offset-x": "-5%"
            }
        },
        "plot": {
            "background-color": "#000000",
            "alpha": 1,
            "bar-space": "10px",
            "tooltip-text": "%v", //Aquiiiiiii
            "animation": {
                "effect": 4,
                "method": "0",
                "sequence": "4"
            }
        },
        "plotarea": {
            "margin": "22% 5% 15% 10%",
            "background-color": "#ffffff"
        },
        "series": [
            {
                "text": "Palabras",
                "values": [

                ],
                "line-color": "#6FA3C1",
                "background-color": "#6FA3C1",
                "legend-marker": {
                    "border-color": "#6FA3C1"
                }
            },
            {
                "text": "Caracteres escritos",
                "values": [

                ],
                "line-color": "#F79434",
                "background-color": "#F79434",
                "legend-marker": {
                    "border-color": "#F79434"
                }
            },
            {
                "text": "Caracteres borrados",
                "values": [

                ],
                "line-color": "#7A6652",
                "background-color": "#7A6652",
                "legend-marker": {
                    "border-color": "#7A6652"
                }
            }
        ]
    };
    config.title.text = "Grupos - " + nombre_examen
    console.log("Estadisticas grupos del examen " + nombre_examen)

    for (var i = 0; i < grupos.length; i++) {
        insertar_datos_graficas(config, grupos[i].nombre_grupo, grupos[i].num_palabras, grupos[i].num_caracteres_escritos, grupos[i].num_caracteres_borrados, i)
    }

    cargar_grafica("div_grafica_examen_grupos", div_estadisticas, config)
}

function grafica_examen_grupo_respuestas(nombre_examen, grupo, div_estadisticas) {
    var config =
        {
            "type": "hbullet",
            "background-color": "#f4f4f4",
            "title": {
                "text": "", //Aquiiiiiiiiii
                "font-family": "arial",
                "font-size": "28px",
                "font-color": "#434F5B",
                "font-weight": "normal",
                "background-color": "none",
                "margin-top": "3%",
                "text-align": "center"
            },
            "legend": {
                "layout": "float",
                "position": "50% 12%",
                "background-color": "none",
                "border-width": "0px",
                "toggle-action": "remove",
                "item": {
                    "font-family": "arial",
                    "font-weight": "normal",
                    "font-size": "12px",
                    "font-color": "#307C70",
                    "shadow": 0,
                    "cursor": "hand"
                },
                "marker": {
                    "cursor": "hand"
                }
            },
            "scale-y": {
                "values": "0:100:20", //Aquiiiiiiii
                "line-width": "1px",
                "line-color": "#434F5B",
                "format": "%v",
                "line-style": "solid",
                "guide": {
                    "line-color": "#434F5B",
                    "line-style": "solid",
                    "alpha": 0.25
                },
                "tick": {
                    "line-width": "1px",
                    "line-color": "#434F5B"
                },
                "item": {
                    "font-size": "12px",
                    "font-color": "#434F5B",
                    "font-weight": "normal",
                    "font-family": "arial",
                    "offset-y": "5%"
                }
            },
            "scale-x": { //Aquiiiiiiiii
                "values": [

                ],
                "line-color": "#434F5B",
                "line-style": "solid",
                "line-width": "1px",
                "guide": {
                    "line-color": "#434F5B",
                    "line-style": "solid",
                    "alpha": 0.25
                },
                "tick": {
                    "line-width": "1px",
                    "line-color": "#434F5B"
                },
                "item": {
                    "font-size": "12px",
                    "font-color": "#434F5B",
                    "font-weight": "normal",
                    "font-family": "arial",
                    "offset-x": "-5%"
                }
            },
            "plot": {
                "background-color": "#000000",
                "alpha": 1,
                "bar-space": "10px",
                "tooltip-text": "%v", //Aquiiiiiii
                "animation": {
                    "effect": 4,
                    "method": "0",
                    "sequence": "4"
                }
            },
            "plotarea": {
                "margin": "22% 5% 15% 10%",
                "background-color": "#ffffff"
            },
            "series": [
                {
                    "text": "Palabras",
                    "values": [

                    ],
                    "line-color": "#6FA3C1",
                    "background-color": "#6FA3C1",
                    "legend-marker": {
                        "border-color": "#6FA3C1"
                    }
                },
                {
                    "text": "Caracteres escritos",
                    "values": [

                    ],
                    "line-color": "#F79434",
                    "background-color": "#F79434",
                    "legend-marker": {
                        "border-color": "#F79434"
                    }
                },
                {
                    "text": "Caracteres borrados",
                    "values": [

                    ],
                    "line-color": "#7A6652",
                    "background-color": "#7A6652",
                    "legend-marker": {
                        "border-color": "#7A6652"
                    }
                }
            ]
        };
    config.title.text = "Respuestas del grupo " + grupo.nombre_grupo + " - " + nombre_examen

    for (var i = 0; i < grupo.num_caracteres_escritos_respuestas.length; i++) {
        insertar_datos_graficas(config, i + 1, grupo.num_palabras_respuestas[i], grupo.num_caracteres_escritos_respuestas[i], grupo.num_caracteres_borrados_respuestas[i], i)
    }

    cargar_grafica("div_grafica_examen_grupo_respuesta", div_estadisticas, config)
}

function grafica_examen_miembros_grupo(nombre_examen, grupo, div_estadisticas) {
    var config =
        {
            "type": "hbullet",
            "background-color": "#f4f4f4",
            "title": {
                "text": "", //Aquiiiiiiiiii
                "font-family": "arial",
                "font-size": "28px",
                "font-color": "#434F5B",
                "font-weight": "normal",
                "background-color": "none",
                "margin-top": "3%",
                "text-align": "center"
            },
            "legend": {
                "layout": "float",
                "position": "50% 12%",
                "background-color": "none",
                "border-width": "0px",
                "toggle-action": "remove",
                "item": {
                    "font-family": "arial",
                    "font-weight": "normal",
                    "font-size": "12px",
                    "font-color": "#307C70",
                    "shadow": 0,
                    "cursor": "hand"
                },
                "marker": {
                    "cursor": "hand"
                }
            },
            "scale-y": {
                "values": "0:100:20", //Aquiiiiiiii
                "line-width": "1px",
                "line-color": "#434F5B",
                "format": "%v",
                "line-style": "solid",
                "guide": {
                    "line-color": "#434F5B",
                    "line-style": "solid",
                    "alpha": 0.25
                },
                "tick": {
                    "line-width": "1px",
                    "line-color": "#434F5B"
                },
                "item": {
                    "font-size": "12px",
                    "font-color": "#434F5B",
                    "font-weight": "normal",
                    "font-family": "arial",
                    "offset-y": "5%"
                }
            },
            "scale-x": { //Aquiiiiiiiii
                "values": [

                ],
                "line-color": "#434F5B",
                "line-style": "solid",
                "line-width": "1px",
                "guide": {
                    "line-color": "#434F5B",
                    "line-style": "solid",
                    "alpha": 0.25
                },
                "tick": {
                    "line-width": "1px",
                    "line-color": "#434F5B"
                },
                "item": {
                    "font-size": "12px",
                    "font-color": "#434F5B",
                    "font-weight": "normal",
                    "font-family": "arial",
                    "offset-x": "-5%"
                }
            },
            "plot": {
                "background-color": "#000000",
                "alpha": 1,
                "bar-space": "10px",
                "tooltip-text": "%v", //Aquiiiiiii
                "animation": {
                    "effect": 4,
                    "method": "0",
                    "sequence": "4"
                }
            },
            "plotarea": {
                "margin": "22% 5% 15% 10%",
                "background-color": "#ffffff"
            },
            "series": [
                {
                    "text": "Palabras",
                    "values": [

                    ],
                    "line-color": "#6FA3C1",
                    "background-color": "#6FA3C1",
                    "legend-marker": {
                        "border-color": "#6FA3C1"
                    }
                },
                {
                    "text": "Caracteres escritos",
                    "values": [

                    ],
                    "line-color": "#F79434",
                    "background-color": "#F79434",
                    "legend-marker": {
                        "border-color": "#F79434"
                    }
                },
                {
                    "text": "Caracteres borrados",
                    "values": [

                    ],
                    "line-color": "#7A6652",
                    "background-color": "#7A6652",
                    "legend-marker": {
                        "border-color": "#7A6652"
                    }
                }
            ]
        };
    config.title.text = "Alumnos del grupo " + grupo.nombre_grupo + " - " + nombre_examen

    for (var i = 0; i < grupo.miembros.length; i++) {
        insertar_datos_graficas(config, grupo.miembros[i].correo, grupo.num_palabras_respuestas[i], grupo.num_caracteres_escritos_respuestas[i], grupo.num_caracteres_borrados_respuestas[i], i)
    }

    cargar_grafica("div_grafica_examen_miembros_grupo", div_estadisticas, config)
}