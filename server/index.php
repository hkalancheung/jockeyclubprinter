<!DOCTYPE html>
<html lang="en" ng-app="Demo">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="js/angular.min.js"></script>
    <script src="js/main.js"></script>
    <title>Jockey Club Printing</title>

    <!-- Bootstrap -->
    <link href="css/bootstrap.min.css" rel="stylesheet">
     <link href="css/main.css" rel="stylesheet">

    <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
  </head>
 <body ng-controller="DemoController" id="someElem">

<div id="printable" width="100%">
  <img src = "{{queues[0].image_url}}" width="100%">
</div>

<div id="non-printable">
  <center><button class="btn btn-action" ng-click="sendToPrinter()">Print</button></center>

  <ul class="nav nav-pills nav-stacked">
    <li class="active">
      <a href="#">
        <span class="badge pull-left">{{queues.length}}</span>
          &nbsp; Print Queue
      </a>
    </li>
    <br>
  </ul>


  <!-- Show existing queues. -->
    <ul class="list-group">
      <li class="list-group-item" ng-repeat="queue in queues" >

        
        <img src = "{{queue.image_url}}" height="100px">

         <button ng-click="removeQueue( queue )" class="btn btn-danger">Remove</button>

      </li>
    </ul>
</div>


    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
    <!-- Include all compiled plugins (below), or include individual files as needed -->
    <script src="js/bootstrap.min.js"></script>
    
    
  </body>
</html>