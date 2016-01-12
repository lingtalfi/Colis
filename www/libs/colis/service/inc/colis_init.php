<?php


use Bat\FileSystemTool;
use YouTubeUtils\YouTubeTool;
use YouTubeUtils\YouTubeVideo;


//------------------------------------------------------------------------------/
// FAKE APPLICATION CONFIG FILE
//------------------------------------------------------------------------------/
/**
 * In prod, you'll replace this file by your application config file of course...
 */

require_once "bigbang.php";
$webRootDir = realpath(__DIR__ . "/../../../../../www");
$apiKey = "[API_KEY]"; // your youtube API KEY


define ('APP_WEB_DIR', realpath(__DIR__ . "/../../../../../www"));
define ('APP_ITEM_DIR', APP_WEB_DIR . '/libs/colis/service/uploads');


/**
 * @return array (ling-colis implementation)
 *
 * - info:
 * ----- type: none|image|video|youtube
 *                      none if the type is unrecognized
 *                      image for an image
 *                      video for a local mp4 file
 *                      youtube for a youtube url
 * -----[image]
 * ----- src
 * -----[/image]
 *
 * -----[video]
 * ----- src
 * ----- duration
 * -----[/video]
 *
 * -----[youtube]
 * ----- title
 * ----- description
 * ----- duration
 * ----- thumbnail
 * ----- iframe
 * -----[/youtube]
 *
 */
function getInfoByName($name)
{
    global $webRootDir, $apiKey;


    $type = 'none';
    $ext = strtolower(FileSystemTool::getFileExtension($name));
    $ext2Type = [
        'jpg' => 'image',
        'jpeg' => 'image',
        'gif' => 'image',
        'png' => 'image',
        'mp4' => 'video',
    ];
    if (array_key_exists($ext, $ext2Type)) {
        $type = $ext2Type[$ext];
    }

    $finalName = null;

    if (
        0 === strpos($name, 'http://') ||
        0 === strpos($name, 'https://')
    ) {
        $finalName = $name;
        // handling youtube urls
        if (false !== ($youTubeId = YouTubeTool::getId($finalName))) {
            $type = 'youtube';
        }
    }
    else {
        // look for a file named name in a specific dir...
        $urlPrefix = '/libs/colis/service/uploads';
        $finalName = $urlPrefix . '/' . $name;
    }

    switch ($type) {
        case 'image':
            return [
                'type' => $type,
                'src' => $finalName,
            ];
            break;
        case 'youtube':
            $v = YouTubeVideo::create()->setVideoId($youTubeId)->setApiKey($apiKey);
            $iframe = '<iframe src="https://www.youtube.com/embed/' . $youTubeId . '" frameborder="0" allowfullscreen></iframe>';


            return [
                'type' => $type,
                'title' => $v->getTitle(),
                'description' => nl2br($v->getDescription()),
                'duration' => $v->getDuration(),
                'thumbnail' => $v->getThumbnail(),
                'iframe' => $iframe,
            ];

            break;
        case 'video':
            $realPath = $webRootDir . $finalName;
            $duration = getVideoDuration($realPath);
            return [
                'type' => $type,
                'src' => $finalName,
                'duration' => $duration,
            ];
            break;
        default:
            return [
                "type" => $type,
            ];
            break;
    }
}


function getVideoDuration($file)
{
    $cmd = '/opt/local/bin/ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "' . str_replace('"', '\"', $file) . '"';
    $ret = 0;
    ob_start();
    passthru($cmd, $ret);
    return ob_get_clean();
}