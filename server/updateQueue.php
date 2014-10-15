<?php
include("config.php");
if ($_GET['id']){
	$printingQueue = Queue::find($_GET['id']);
	
	$printingQueue->status = $_GET['status'];
	$printingQueue->save();
	# UPDATE `printingQueues` SET title='Some real title' WHERE id=1
	// $printingQueue->update_attributes(array('title' => 'Some other title', 'author_id' => 1));
	# UPDATE `posts` SET title='Some other title', author_id=1 WHERE id=1
}
?>