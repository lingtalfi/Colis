<?php


use Colis\InfoHandler\LingLocalWithExtensionInfoHandler;
use Colis\UploaderHandler\ColisTimUploaderHandler;
use Tim\TimServer\TimServer;
use Tim\TimServer\TimServerInterface;

require_once 'inc/colis_init.php';

/**
 * I've gave up the development of such a server for now, because 
 * I was so disappointed with the poor performances:
 * I compared this script with the flat colis_upload.php script,
 * and the colis_upload.php script was much faster, I could see the difference with the eyes:
 * each chunk takes a few milliseconds more with the script below...
 * 
 * So personnally, I prefer to tweak the code of colis_upload.php and have better perfs, than having
 * more organized but slower code.
 * 
 * Now, if YOU would go the other way around, please feel free to use the code below, and continue the development
 * of the Colis classes if it seems right to you.
 * 
 * 
 * 
 */



TimServer::create()->start(function (TimServerInterface $s) {

    ColisTimUploaderHandler::create()
        ->addInfoHandler(LingLocalWithExtensionInfoHandler::create()
                ->setWebRoot(APP_WEB_DIR)
                ->setItemDir(APP_ITEM_DIR)
        )
        ->setTimServer($s)
        ->setDstDir('uploads')
        ->handle();

})
    ->output();