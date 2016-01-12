<?php


use Tim\TimServer\TimServer;
use Tim\TimServer\TimServerInterface;
use YouTubeUtils\YouTubeVideo;

/**
 * This is an example of implementation.
 * It's the ling-colis implementation.
 */
require_once 'inc/colis_init.php';


TimServer::create()->start(function (TimServerInterface $s) {


    if (isset($_POST['name'])) {
        $name = $_POST['name'];
        $s->success(getInfoByName($name));
    }
    else {
        $s->error("Invalid input data: missing name");
    }

})->output();
