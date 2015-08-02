/* Copyright @2015 All rights Reserver
 * NAGARAJU SANGAM 
 * 
 * NOTICE: Authorization to use the below sample code is granted, providedthat you respect the authors idea.
 * Author is not responsibel for the minor errors, however those errors will be corrected over time in the subsequent releases. Use this code at your sole descrition.
 */

/*
@Author: sangamna
@CreateOn: Thu Jul 30 2015 15:41:55 GMT+0530 (India Standard Time)
@description: service:EmpApp.Employee
*/

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, brackets */
 
(function(){
  "use strict";
  angular.module('EmpApp')
    .service('Employee', ['$http', '$q',
        function($http,$q) {
          var svc = {};
           svc.getData= function(){
               var def = $q.defer(),
               p = def.promise;
               
               def.resolve( {
                            "id":123,
                            "name":"Nag",
                            "role":"UI Developer",
                            "photoUrl":"app/resources/img/nag.png"
                          } );
                return p;          
            }
          return svc;  
        }
    ]);
})();
 
/**** END OF FILE *****/