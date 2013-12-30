<?php
    $url = $_GET['url'];
    $callback = $_GET['callback'];

    $imgData = base64_encode(file_get_contents($url));
    $src = 'data: '.mime_content_type(basename($img_file)).';base64,'.$imgData;

    $json = $callback."(".json_encode($src).");";

    header('Content-Type: application/javascript; charset=UTF-8');
    echo $json;
?>