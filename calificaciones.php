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
require_once($CFG->libdir . '/gradelib.php');

$id = optional_param('id', 0, PARAM_INT); // Course_module ID, or
$notas = $_POST['text'];
$examen_activado = optional_param('examen_activado', -1, PARAM_INT);

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

$coursecontext = context_course::instance($course->id);
$role = $DB->get_record('role', array('shortname' => 'editingteacher'));
$teachers = get_role_users($role->id, $coursecontext);

$teachers_array = array_values($teachers);

$coursecontext = context_course::instance($course->id);
$role = $DB->get_record('role', array('shortname' => 'student'));
$students = get_role_users($role->id, $coursecontext);

$students_array = array_values($students);
$students_length = count($students_array);

if ($notas != null) {
    $notas_length = count($notas);
    $params = array('itemname'=>$tfm->name, 'idnumber'=>$tfm->id);
    for ($i = 0; $i < $notas_length; $i++) {
        $grade = new stdClass();
        $grade->userid   = $students_array[$i]->id;
        $grade->rawgrade = $notas[$i];
        if ($notas[$i] != "") {
            grade_update('mod/tfm', $tfm->course, 'mod', 'tfm', $tfm->id, 0, $grade, $params);
        }
    }
}

$usersId = array();
for ($i = 0; $i < $students_length; $i++) {
    $usersId[$students_array[$i]->email] = $students_array[$i]->id;
}

$grading_info = grade_get_grades($course->id, 'mod', 'tfm', $tfm->id, $usersId);

$grading_array = array_values($grading_info->items);

$notas_alumnos_array = array_values($grading_array[0]->grades);
$notas_length = count($notas_alumnos_array);

// Print the page header.

$PAGE->set_url('/mod/tfm/calificaciones.php', array('id' => $cm->id));
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
	<script type="text/javascript">
        var id = <?php echo json_encode($id)?>;
        var id_documento = <?php echo json_encode($tfm->id_documento)?>;
        var alumnos = <?php echo json_encode($students_array)?>;
        var teachers = <?php echo json_encode($teachers_array)?>;
        var profesores = []
        for (var i = 0; i < teachers.length; i++) {
            var profesor = {
                "nombre" : teachers[i].firstname,
                "apellidos" : teachers[i].lastname,
                "correo" : teachers[i].email
            }

            profesores.push(profesor)
        }
    </script>
    <link rel="stylesheet" type="text/css" href="<?php echo $CFG->wwwroot?>/mod/tfm/css/estilos.css">
    <script type="text/javascript" src="https://apis.google.com/js/api.js"></script>
    <script type="text/javascript" src="<?php echo $CFG->wwwroot?>/mod/tfm/js/realtime-client-utils.js"></script>
    <script type="text/javascript" src="<?php echo $CFG->wwwroot?>/mod/tfm/js/id.js"></script>
	<script type="text/javascript" src="<?php echo $CFG->wwwroot?>/mod/tfm/js/script.js"></script>
    <script type="text/javascript" src="<?php echo $CFG->wwwroot?>/mod/tfm/js/calificaciones.js"></script>
    <?php

    
    // echo json_encode($notas);
    echo '
    <div id="div_interfaz">
        <ul class="ul">
            <li class="li"><a href="gestionar_preguntas.php?id='; echo json_encode($id); echo'">Gestionar preguntas</a></li>
            <li class="li"><a href="gestionar_grupos.php?id='; echo json_encode($id); echo'">Gestionar grupos</a></li>
            ';
        if ($tfm->examen_activado == 0) {
            echo '
            <li class="li"><a href="activar_examen.php?id='; echo json_encode($id); echo'">Activar examen</a></li>
            ';
        } else {
            echo '
            <li class="li"><a href="desactivar_examen.php?id='; echo json_encode($id); echo'">Desactivar examen</a></li>
            ';
        }
        echo'
            <li class="li"><a href="ver_examen.php?id='; echo json_encode($id); echo'">Ver examen</a></li>
            <li class="li"><a class="active" href="calificaciones.php?id='; echo json_encode($id); echo'">Calificaciones</a></li>
            <li class="li"><a href="estadisticas.php?id='; echo json_encode($id); echo'">Estadísticas</a></li>
            <li class="li"><a href="borrar_examen.php?id='; echo json_encode($id); echo'">Borrar examen</a></li>
        </ul>
        <div id="div_notas">
            <form id="form_table" method="post" action="calificaciones.php">
            <input type="hidden" name="id" value="'; echo json_encode($id); echo '"/>
            <table>
                <tr>
                    <th>Correo</th>
                    <th>Nota actual</th>
                    <th>Nota nueva</th>
                </tr>';
                    for($i = 0; $i < $notas_length; $i++) {
                        echo '<tr>';
                        echo '<td>'; echo $students_array[$i]->email; echo '</td>';
                        echo '<td>'; echo floatval($notas_alumnos_array[$i]->grade); echo '</td>';
                        echo '<td>'; echo '<textarea class="textarea" id='; echo 'textarea'.$students_array[$i]->email; echo ' form="form_table" name="text[]"></textarea></td>';
                        echo '</tr>';
                    }
        echo'
            </table>
            <input type="submit" value="Guardar">
            </form>
        </div>
        <div id="div_estadisticas">
            
        </div>
    </div>
    <script>
        autorizar()
    </script>
    ';
}

echo $OUTPUT->footer();