<?php
require_once __DIR__ . '/lib/ActiveRecord.php';

class Queue extends ActiveRecord\Model { }

// initialize ActiveRecord
// change the connection settings to whatever is appropriate for your mysql server 
ActiveRecord\Config::initialize(function($cfg)
{
    $cfg->set_model_directory('.');
    $cfg->set_connections(array(
    	'development' => 'mysql://root:root@127.0.0.1/hkjcprinter',
    	'production' => 'mysql://root:icgxPassw0rd@localhost/hkjcprinter')
    );
    $cfg->set_default_connection('production');
});

?>