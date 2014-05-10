<?php 

function echoActiveClassIfRequestMatches($requestUri)
{
  $current_file_name = basename($_SERVER['REQUEST_URI'], ".php");
  if ($current_file_name == $requestUri)
    echo 'class="active"';
  if ($current_file_name == "" && $requestUri == "index")
  	echo 'class="active"';  
}

?>