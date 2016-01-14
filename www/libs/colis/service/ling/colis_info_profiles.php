<?php


use Tim\TimServer\TimServer;
use Tim\TimServer\TimServerInterface;


//------------------------------------------------------------------------------/
// COLIS LING - INFO SERVICE - PROFILES VERSION
//------------------------------------------------------------------------------/
require_once 'inc/colis_init_profiles.php';


TimServer::create()->start(function (TimServerInterface $s) {

    if (isset($_REQUEST["id"])) {

        $profileId = $_REQUEST['id'];

        if (isset($_POST['name'])) {
            $name = $_POST['name'];
            $s->success(colis_get_info($name, $profileId));
        }
        else {
            $s->error("Invalid input data: missing name");
        }

    }
    else {
        $s->error("id not set");
    }


})->output();
