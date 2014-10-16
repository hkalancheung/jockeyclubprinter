<?php
include("config.php");

if ($_GET['image_url']){
	$printingQueue = new Queue();
	$printingQueue->status = 'NEW';
	$printingQueue->wayin_id = $_GET['wayin_id'];
	$printingQueue->image_url = $_GET['image_url'];
	$printingQueue->printer_id = $_GET['printer_id'];
	$printingQueue->added_time = date('Y-m-d H:i:s');


	$printingQueue->save();
}
?>
