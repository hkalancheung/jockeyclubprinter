

        // Define the module for our AngularJS application.
        var app = angular.module( "Demo", [] );


        // -------------------------------------------------- //
        // -------------------------------------------------- //


        // I control the main demo.
        app.controller(
            "DemoController" ,
            function( $scope, queueService) {

                // I contain the list of queues to be rendered.
                $scope.queues = [];

                // I contain the ngModel values for form interaction.
                $scope.form = {
                    name: ""
                };

                loadRemoteData();

                // setInterval(function(){
                //     $scope.refresh();
                // },5000);


                // ---
                // PUBLIC METHODS.
                // ---


                // I process the add-queue form.
                $scope.addQueue = function() {

                    // If the data we provide is invalid, the promise will be rejected,
                    // at which point we can tell the user that something went wrong. In
                    // this case, I'm just logging to the console to keep things very
                    // simple for the demo.
                    queueService.addQueue( $scope.form.name )
                        .then(
                            loadRemoteData,
                            function( errorMessage ) {

                                console.warn( errorMessage );

                            }
                        )
                    ;

                    // Reset the form once values have been consumed.
                    $scope.form.name = "";

                };


                // I remove the given queue from the current collection.
                $scope.removeQueue = function( queue ) {

                    // Rather than doing anything clever on the client-side, I'm just
                    // going to reload the remote data.
                    queueService.removeQueue( queue.id )
                         .then( loadRemoteData )
                    ;

                };

                $scope.refresh = function( queue ) {
                    loadRemoteData();
                };

                $scope.sendToPrinter = function(){
                   
                    printContent('printable');
                };


                // ---
                // PRIVATE METHODS.
                // ---


                // I apply the remote data to the local scope.
                function applyRemoteData( newQueues ) {

                    $scope.queues = newQueues;

                }


                // I load the remote data from the server.
                function loadRemoteData() {

                    // The queueService returns a promise.
                    queueService.getQueues()
                        .then(
                            function( queues ) {

                                applyRemoteData( queues );

                            }
                        )
                    ;

                }

            }
        );


        // -------------------------------------------------- //
        // -------------------------------------------------- //


        // I act a repository for the remote queue collection.
        app.service(
            "queueService",
            function( $http, $q ) {

                // Return public API.
                return({
                    addQueue: addQueue,
                    getQueues: getQueues,
                    removeQueue: removeQueue
                });


                // ---
                // PUBLIC METHODS.
                // ---


                // I add a queue with the given name to the remote collection.
                function addQueue( name ) {

                    var request = $http({
                        method: "post",
                        url: "api/index.cfm",
                        params: {
                            action: "add"
                        },
                        data: {
                            name: name
                        }
                    });

                    return( request.then( handleSuccess, handleError ) );

                }


                // I get all of the queues in the remote collection.
                function getQueues() {
                    var query = getQueryParams(document.location.search);


                    var request = $http({
                        method: "get",
                        url: "getQueue.php",
                        params: {
                            action: "get",
                            printer_id: query.printer_id,
                        }
                    });

                    return( request.then( handleSuccess, handleError ) );

                }


                // I remove the queue with the given ID from the remote collection.
                function removeQueue( id ) {
                    console.log('remove:'+id);
                    var request = $http({
                        method: "get",
                        url: "updateQueue.php",
                        params: {
                            action: "get",
                            id:id,
                            status:'REMOVED'
                        },
                        data: {
                            id: id
                        }
                    });

                    return( request.then( handleSuccess, handleError ) );

                }


                // ---
                // PRIVATE METHODS.
                // ---


                // I transform the error response, unwrapping the application dta from
                // the API response payload.
                function handleError( response ) {

                    // The API response from the server should be returned in a
                    // nomralized format. However, if the request was not handled by the
                    // server (or what not handles properly - ex. server error), then we
                    // may have to normalize it on our end, as best we can.
                    if (
                        ! angular.isObject( response.data ) ||
                        ! response.data.message
                        ) {

                        return( $q.reject( "An unknown error occurred." ) );

                    }

                    // Otherwise, use expected error message.
                    return( $q.reject( response.data.message ) );

                }


                // I transform the successful response, unwrapping the application data
                // from the API response payload.
                function handleSuccess( response ) {

                    return( response.data );

                }

            }
        );

function getQueryParams(qs) {
    qs = qs.split("+").join(" ");

    var params = {}, tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])]
            = decodeURIComponent(tokens[2]);
    }

    return params;
}

function printContent(el){
    console.log('printing...'+el);
    // var restorepage = document.body.innerHTML;
    // var printcontent = document.getElementById(el).innerHTML;
    // document.body.innerHTML = printcontent;
    window.print();
    // document.body.innerHTML = restorepage;


}


//var query = getQueryParams(document.location.search);
//alert(query.foo);


//angular.element("someElem").scope().loadRemoteData();
//angular.element(document.body).injector().get('queueService').getQueues()
