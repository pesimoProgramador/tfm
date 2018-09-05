<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Prints a particular instance of tfm
 *
 * You can have a rather longer description of the file as well,
 * if you like, and it can span multiple lines.
 *
 * @package    mod_tfm
 * @copyright  2016 Your Name <your@email.address>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

// Replace tfm with the name of your module and remove this line.

require_once(dirname(dirname(dirname(__FILE__))).'/config.php');
require_once(dirname(__FILE__).'/lib.php');

$id = optional_param('id', 0, PARAM_INT);
$borrar_examen = optional_param('borrar_examen', 0, PARAM_INT);
$n  = optional_param('n', 0, PARAM_INT);  // ... tfm instance ID - it should be named as the first character of the module.

if ($id) {
    $cm         = get_coursemodule_from_id('tfm', $id, 0, false, MUST_EXIST);
    $course     = $DB->get_record('course', array('id' => $cm->course), '*', MUST_EXIST);
    $tfm  = $DB->get_record('tfm', array('id' => $cm->instance), '*', MUST_EXIST);
} else if ($n) {
    $tfm  = $DB->get_record('tfm', array('id' => $n), '*', MUST_EXIST);
    $course     = $DB->get_record('course', array('id' => $tfm->course), '*', MUST_EXIST);
    $cm         = get_coursemodule_from_instance('tfm', $tfm->id, $course->id, false, MUST_EXIST);
} else {
    error('You must specify a course_module ID or an instance ID');
}

require_login($course, true, $cm);

$context = context_module::instance($cm->id);
$alumno = has_capability('mod/tfm:submit', $context);

$event = \mod_tfm\event\course_module_viewed::create(array(
    'objectid' => $PAGE->cm->instance,
    'context' => $PAGE->context,
));
$event->add_record_snapshot('course', $PAGE->course);
$event->add_record_snapshot($PAGE->cm->modname, $tfm);
$event->trigger();

if ($borrar_examen == 1) {
    $$row = new stdClass();
    $row->id = $tfm->id;
    $row->id_documento = "";
    $row->examen_activado = 0;
    $row->examen_activado_primera_vez = 0;
    $DB->update_record("tfm", $row, $bulk=false);

    $tfm->examen_activado = 0;
}

// Print the page header.

$PAGE->set_url('/mod/tfm/borrar_examen.php', array('id' => $cm->id));
$PAGE->set_title(format_string($tfm->name));
$PAGE->set_heading(format_string($course->fullname));

// Output starts here.
echo $OUTPUT->header();

// Conditions to show the intro can change to look for own settings or whatever.
if ($tfm->intro) {
    echo $OUTPUT->box(format_module_intro('tfm', $tfm, $cm->id), 'generalbox mod_introbox', 'tfmintro');
}

if (!$alumno) {
    ?>
    <link rel="stylesheet" type="text/css" href="<?php echo $CFG->wwwroot?>/mod/tfm/css/estilos.css">
    <?php
    if ($tfm->examen_activado == 0) {
        if ($borrar_examen == 1) {
            ?>
            <script type="text/javascript">
                var id = <?php echo json_encode($id)?>;
                var id_documento = <?php echo json_encode($tfm->id_documento)?>;
            </script>
            <script type="text/javascript" src="https://apis.google.com/js/api.js"></script>
            <script type="text/javascript" src="<?php echo $CFG->wwwroot?>/mod/tfm/js/realtime-client-utils.js"></script>
            <script type="text/javascript" src="<?php echo $CFG->wwwroot?>/mod/tfm/js/id.js"></script>
            <script type="text/javascript" src="<?php echo $CFG->wwwroot?>/mod/tfm/js/script.js"></script>
            <script type="text/javascript" src="<?php echo $CFG->wwwroot?>/mod/tfm/js/borrar_examen.js"></script>
            <?php
            echo "
            <div id='div_interfaz'>
            <ul class='ul deshabilitado'>
                <li class='li'><a href='gestionar_preguntas.php?id={$id}'>Gestionar preguntas</a></li>
                <li class='li'><a href='gestionar_grupos.php?id={$id}'>Gestionar grupos</a></li>
                ";
            if ($tfm->examen_activado == 0) {
                echo "
                <li class='li'><a href='activar_examen.php?id={$id}'>Activar examen</a></li>
                ";
            } else {
                echo "
                <li class='li'><a href='desactivar_examen.php?id={$id}'>Desactivar examen</a></li>
                ";
            }
            echo "
                <li class='li'><a href='ver_examen.php?id={$id}'>Ver examen</a></li>
                <li class='li'><a href='calificaciones.php?id={$id}'>Calificaciones</a></li>
                <li class='li'><a href='estadisticas.php?id={$id}'>Estadísticas</a></li>
                <li class='li'><a class='active' href='borrar_examen.php?id={$id}'>Borrar examen</a></li>
            </ul>
            </div>
            <div id='div_formulario'></div>
            <script>
                autorizar()
            </script>
            ";
        } else {
            echo "
            <div id='div_interfaz'>
            <ul class='ul'>
                <li class='li'><a href='gestionar_preguntas.php?id={$id}'>Gestionar preguntas</a></li>
                <li class='li'><a href='gestionar_grupos.php?id={$id}'>Gestionar grupos</a></li>
                ";
            if ($tfm->examen_activa == 0) {
                echo "
                <li class='li'><a href='activar_examen.php?id={$id}'>Activar examen</a></li>
                ";
            } else {
                echo "
                <li class='li'><a href='desactivar_examen.php?id={$id}'>Desactivar examen</a></li>
                ";
            }
            echo "
                <li class='li'><a href='ver_examen.php?id={$id}'>Ver examen</a></li>
                <li class='li'><a href='calificaciones.php?id={$id}'>Calificaciones</a></li>
                <li class='li'><a href='estadisticas.php?id={$id}'>Estadísticas</a></li>
                <li class='li'><a class='active' href='borrar_examen.php?id={$id}'>Borrar examen</a></li>
            </ul>
            </div>
            <div>
            <h3>¿Seguro qué desea borrar el examen?</h3>
            <form method='get' action='borrar_examen.php'>
                <input type='hidden' name='id' value='{$id}'/>
                <input type='hidden' name='borrar_examen' value='1'/>
                <input type='submit' value='Aceptar'>
            </form>
            </div>
            ";
        }
    } else {
        echo "
        <ul class='ul'>
            <li class='li'><a href='gestionar_preguntas.php?id={$id}'>Gestionar preguntas</a></li>
            <li class='li'><a href='gestionar_grupos.php?id={$id}'>Gestionar grupos</a></li>
            ";
        if ($tfm->examen_activado == 0) {
            echo "
            <li class='li'><a href='activar_examen.php?id={$id}'>Activar examen</a></li>
            ";
        } else {
            echo "
            <li class='li'><a href='desactivar_examen.php?id={$id}'>Desactivar examen</a></li>
            ";
        }
        echo "
            <li class='li'><a href='examen.php?id={$id}'>Ver examen</a></li>
            <li class='li'><a href='calificaciones.php?id={$id}'>Calificaciones</a></li>
            <li class='li'><a class='active' href='borrar_examen.php?id={$id}'>Borrar examen</a></li>
        </ul>
        <h3>Desactive el examen antes de borrarlo</h3>
        ";
    }
    
}

echo $OUTPUT->footer();