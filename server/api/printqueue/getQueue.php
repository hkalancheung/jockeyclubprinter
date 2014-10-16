<?php
include("config.php");

# finding using a conditions array
$printingQueue = Queue::find('all',array('conditions' => array('printer_id = ? and status =? ',$printer_id,'NEW')));


// print_r($printingQueue);



if ($printingQueue){
	$output=array();
	foreach ($printingQueue as $thisRow){
		// echo $printingQueue->id;
		$tempOutput=array();
		$tempOutput['id']=$thisRow->id;
		$tempOutput['wayin_id']=$thisRow->wayin_id;
		$tempOutput['image_url']=$thisRow->image_url;
		array_push($output,$tempOutput);
	}
	
	


	echo json_encode( $output);
}

?>
