/* Copyright @2015 All rights Reserver
 * NAGARAJU SANGAM 
 * 
 * NOTICE: Authorization to use the below sample code is granted, providedthat you respect the authors idea.
 * Author is not responsibel for the minor errors, however those errors will be corrected over time in the subsequent releases. Use this code at your sole descrition.
 */

/*
@Author: sangamna
@CreateOn: Thu Jul 30 2015 15:48:35 GMT+0530 (India Standard Time)
@description: directive:Emp.idcard
*/

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, brackets */
 
(function(){
  "use strict";
  angular.module('EmpApp')
    .directive('idcard',[function () {
            return {
                restrict: 'E',
                replace: false,
                templateUrl: genericTemplateFunction,
                controller: "genericDirectiveController"
            };
        }]);
})();
 
/**** END OF FILE *****/