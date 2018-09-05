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

$id = optional_param('id', 0, PARAM_INT); // Course_module ID, or
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

//Grupos de Moodle
$grupos = groups_get_all_groups($course->id);
$grupos_array = array_values($grupos);
$grupos_length = count($grupos_array);

$grupos_html = array();

if ($grupos_length > 0) {
    for ($i = 0; $i < $grupos_length; $i++) {
        
        $grupo = new stdClass();
        $grupo->nombre_grupo = $grupos_array[$i]->name;
        $grupo->miembros = array();
        
        $miembros_grupo = groups_get_members($grupos_array[$i]->id);
        $miembros_grupo_array = array_values($miembros_grupo);
        $miembros_grupo_length = count($miembros_grupo_array);
        
        for ($j = 0; $j < $miembros_grupo_length; $j++) {
            
            $usuario = new stdClass();
            $usuario->nombre = $miembros_grupo_array[$j]->firstname;
            $usuario->apellidos = $miembros_grupo_array[$j]->lastname;
            $usuario->correo = $miembros_grupo_array[$j]->email;
            
            array_push($grupo->miembros, $usuario);
        }
        
        array_push($grupos_html, $grupo);
    }
}

$grupos_html_length = count($grupos_html);

// Print the page header.

$PAGE->set_url('/mod/tfm/gestionar_grupos.php', array('id' => $cm->id));
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
<script>
    var id = <?php echo json_encode($id) ?>;
    var id_documento = <?php echo json_encode($tfm->id_documento)?>;
    var grupos = <?php echo json_encode($grupos_html) ?>;
</script>
<script type="text/javascript" src="https://apis.google.com/js/api.js"></script>
<script type="text/javascript" src="<?php echo $CFG->wwwroot?>/mod/tfm/js/realtime-client-utils.js"></script>
<script type="text/javascript" src="<?php echo $CFG->wwwroot?>/mod/tfm/js/id.js"></script>
<script type="text/javascript" src="<?php echo $CFG->wwwroot?>/mod/tfm/js/script.js"></script>
<script type="text/javascript" src="<?php echo $CFG->wwwroot?>/mod/tfm/js/gestionar_grupos.js"></script>
<?php
    echo "
    <div id='divInterfaz'>
        <div>
        <ul class='ul'>
            <li class='li'><a href='gestionar_preguntas.php?id={$id}'>Gestionar preguntas</a></li>
            <li class='li'><a class='active' href='gestionar_grupos.php?id={$id}'>Gestionar grupos</a></li>
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
            <li class='li'><a href='borrar_examen.php?id={$id}'>Borrar examen</a></li>
        </ul>
        </div>
		";
		if ($tfm->examen_activado_primera_vez == 1) {
		echo "
		<h5>No se pueden elegir grupos de alumnos debido a que se ha activado el examen al menos una vez.</h5>
		";
		} else {
		echo "
        <h4>Elija los grupos de alumnos para el examen.</h4>
        <div>
            <br>
            <h5>Grupos de Moodle</h5>
            ";
            for ($i = 0; $i < $grupos_html_length; $i++) {
                echo "
                <label>
                    <input type='checkbox' name='checkbox_grupos' onclick='checkbox_cambiado(this.value, this.checked)' value={$i} />";
                    echo $grupos_html[$i]->nombre_grupo;
                    echo '
                    <ul style="list-style-type:disc">
                    ';
                    $miembros_html = $grupos_html[$i]->miembros;
                    $miembros_html_length = count($miembros_html);
                    for ($j = 0; $j < $miembros_html_length; $j++) {
                        echo "<li>{$miembros_html[$j]->nombre} {$miembros_html[$j]->apellidos} - {$miembros_html[$j]->correo}</li>";
                    }
                    echo "
                    </ul> 
                </label>
                ";
            }
			echo "
			</div>
			";
		}
    echo "
        
    </div>
    <script>
        autorizar()
    </script>
    ";
}

// Finish the page.
echo $OUTPUT->footer();
