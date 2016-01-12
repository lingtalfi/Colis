Colis
===========
2016-01-12



Colis is an input form control connected to a library of user items (videos, images, you decide...).
 
 
 
Colis can be installed as a [planet](https://github.com/lingtalfi/Observer/blob/master/article/article.planetReference.eng.md).


 
 
 
Features of colis
------------
 
- management of a user personal item's library (select item and upload item)
- auto complete feature to search in the library
- drop zone for uploading items to the library
- easy to extend (you can create your own meta data for the preview for instance)
 



Overview 
---------------


Colis is used to choose a media from a user's personal library.
For instance, if a user can upload videos to her account, then she can use the colis form control to select which video she wants
to use on her home page.
It also works for images, and actually any type of media.

Colis is at its base a simple input form control, but it comes with a few helpers:

- an auto complete engine
- a preview zone
- a drop zone to upload media


colis also uses server scripts.




Overview in images
-----------

![support for autocomplete](http://s19.postimg.org/4xyh3etwj/colis_autocomplete.jpg)
![support for chunking](http://s19.postimg.org/gbplsctsz/colis_chunking.jpg)
![import youtube url](http://s19.postimg.org/cgm7psan7/colis_import_youtube_url.jpg)
![upload image](http://s19.postimg.org/ez7wqgwdf/colis_upload_image.jpg)
![upload video](http://s19.postimg.org/65h09d9er/colis_upload_video.jpg)

 
The inner mechanism
---------------------

There are four components:

- the main input
- a selector component (list the items of the user), this is the input on the screenshots
- an uploader (responsible to upload new items)
- a preview zone, which helps the user to preview the item she's selected/uploaded, in dark gray on the screenshots


 
You have to implement a system that ties all the components together.
Such a system is already implemented and is called "ling colis", and you can use it if you want, or create your own, by reading the source code 
of colis.js.





To use ling colis 
-------------------


First, install Colis

Don't forget to map the www folder inside the Colis planet to the web dir of your app.

Also, for the specific example below, I used the [DirScanner](https://github.com/lingtalfi/DirScanner) (so you need to install 
the DirScanner planet too, or tweak the code...).


Then, open an php page served by your web server, and paste this code.
It uses the [portable autoloader technique](https://github.com/lingtalfi/TheScientist/blob/master/convention.portableAutoloader.eng.md), aka bigbang.


```php
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8"/>

    <title>Colis</title>


    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/plupload/2.1.8/jquery.ui.plupload/css/jquery.ui.plupload.css" type="text/css"/>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/plupload/2.1.8/plupload.full.min.js"></script>
    <!-- other language -->
    <!--    <script src="https://cdnjs.cloudflare.com/ajax/libs/plupload/2.1.8/i18n/fr.js"></script>-->
    
    <script src="https://cdn.rawgit.com/lingtalfi/JGoodies/master/jgoodies.js"></script>
    <script src="http://cdn.rawgit.com/twitter/typeahead.js/master/dist/typeahead.jquery.min.js"></script>
    <script src="https://cdn.rawgit.com/lingtalfi/Tim/master/js/tim-functions/tim-functions.js"></script>
    
    
    <!-- ---------------------------------------------------------- -->
    <!-- LOCAL -->
    <!-- ---------------------------------------------------------- -->
    <script src="/libs/colis/js/colis.js"></script>
    <script src="/libs/colis/js/colis-ling.js"></script>
    <link rel="stylesheet" href="/libs/colis/css/colis-ling.css">
    


    <style>

        body {
            font: 13px Verdana;
            background: #eee;
            color: #333;
        }

    </style>

</head>
<body>

<h1>Colis</h1>


<form>
    <input class="colis_selector" type="text">
    <input type="submit" value="Submit"/>
</form>


<script type="text/javascript">

    (function ($) {
        $(document).ready(function () {


            <?php  
            use DirScanner\YorgDirScannerTool;
            require_once "bigbang.php";
            
            $d = __DIR__ . '/libs/colis/service/uploads';
            $files = YorgDirScannerTool::getFiles($d, true, true);
            ?>
            
            var itemList = <?php echo json_encode($files); ?>;
            
            $('.colis_selector').colis({
                selector: {
                    items: itemList
                }
            });
            
        });
    })(jQuery);


</script>


</body>
</html>

```


Also, the ling colis services (in **www/libs/colis/service**) use the [Tim](https://github.com/lingtalfi/Tim) planet,
so you should install Tim too.

Finally, give write permissions to the **www/libs/colis/service/uploads** directory.

When all this is done, open the service files, configure them for your needs (if you want to use YouTube Api, 
you need to set your API_KEY in **www/libs/colis/inc/colis_init.php**). 


Then you should be able to point your browser to this page and play with the colis form control.




### More info about ling colis

ling colis uses:

- [twitter typeahead](https://github.com/twitter/typeahead.js) as the selector component
- [pluploader](http://www.plupload.com/) as the uploader`



It also uses two services: colis_info and colis_upload.


#### colis_info service 

It receives a name as input, and echoes a tim response. 
If successful, it returns an info array (see below).
This service is called when the user picks an item using the selector, or when she clicks the 
refresh button next to it, or when she pastes something into the selector, or after a successful upload.

Its output is used by the preview component to display the selected/uploaded media.


#### colis_upload service 

It receives a file ($_FILES) as input, and echoes a tim response only if the file is totally 
uploaded (in case of chunking, when the last chunk has been uploaded).
  
If successful, it returns the following array: 

```php
- (array)
----- name: the name of the file that has been uploaded
----- info: info array (see below)
```


In case of non terminating chunks (if chunking was used, which is the default), 
then a simple json RPC message is returned. 


This service is called when the user uses the uploader component to upload an item to her library.
Its output is used by the preview component to display the selected/uploaded media,
and by the selector: the item is appended to the current selector's list, and the selector's input is updated too.



###### Important note
 
Before you go and oop the services, beware that I tried to re-organize the colis_upload php using objects (colis_upload_new), 
but this was a failure (according to me), because of the extra time required to load objects for each chunk. 
Still, the code is available and could be remanipulated, or used as is. 

Feel free to compare the difference of speed between both approaches, and choose your weapon.
    
All the [BSR-0](https://github.com/lingtalfi/BumbleBee/blob/master/Autoload/convention.bsr0.eng.md) classes
in the Colis planet are an attempt to provide abstraction for the upload script, those classes are a (abandoned for now)
work in progress. I put them in the planet because they are not fundamentally wrong, and they could maybe save you (or me later?) 
some time if you go the oop way.






#### info array

The info array is defined in www/libs/colis/inc/colis_init.php, in the comments. 



Dependencies
------------------

- [lingtalfi/Bat 1.27](https://github.com/lingtalfi/Bat)
- [lingtalfi/YouTubeUtils 1.1.0](https://github.com/lingtalfi/YouTubeUtils), only if you want to get youtube preview when pasting a youtube url in the selector (input)
- [lingtalfi/Tim 1.2.0](https://github.com/lingtalfi/Tim), only if you use the colis_upload_new service, skip if you don't know what that is
- [lingtalfi/UploaderHandler 1.0.0](https://github.com/lingtalfi/UploaderHandler), only if you use the colis_upload_new service, skip if you don't know what that is



History Log
------------------
    
- 1.0.0 -- 2016-01-12

    - initial commit
    
    




