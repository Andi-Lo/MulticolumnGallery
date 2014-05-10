<?PHP
$btnClass = "btn-primary";		// bootstrap button class
$btnValue = 'Upload';					// button value
$msg = "";										// message: filename + success / fail
$rmv = "";										// is a string with jquery script

if(isset($_POST['send']) && $_POST['send'] == "1"){
	// make sure folder has 'rwx' permission 
	$fileType = $_FILES['userfile']['type'];
	$fileName = $_FILES['userfile']['name'];
	$fileSize = $_FILES['userfile']['size'];
	$fileTmpName = $_FILES['userfile']['tmp_name'];

	/* check the supported fileformats */
	if($fileType === 'image/jpeg' || $fileType === 'image/png' || $fileType === 'image/jpg'){
		/* filename has "thumb" in it so put it in thumbnail folder*/
		if(strpos($fileName, 'thumb', 1) !== false){
			$uploaddir = '../assets/thumbs/';
		} /* its not a thumbnail */
		else{
			$uploaddir = '../assets/images/';
			/* move file into specified folder */
			if(move_uploaded_file($fileTmpName, $uploaddir . $fileName)){
				$btnClass = "btn-success";
				$btnValue = "success!";
				$msg = "<br><p>".$fileName . " uploaded!"."<p>";
				$rmv = removeButtonClass($btnClass);
			} /* upload failed */
			else{
				$btnClass = "btn-danger";
				$btnValue = "upload failed!";
				$msg = "<p>".$fileName . "failed"."<p>";
				$rmv = removeButtonClass($btnClass);
			} /* upload had wrong Fileformat */
		}
	}else{
		$btnClass = "btn-danger";
		$btnValue = "unsupported fileformat";
		$rmv = removeButtonClass($btnClass);
	}
}

/* sets the button color to green / red and resets it to blue after timeout */
function removeButtonClass($buttonClass)
{
	return "<script type=\"text/javascript\"> 
				setTimeout(function(){ 
				$(\"#btnUpload\").removeClass('".$buttonClass."');
				$('#btnUpload').addClass('btn-primary');
				$('#btnUpload').attr('value', 'Upload');
			},2000);
			</script>";	
}

?>