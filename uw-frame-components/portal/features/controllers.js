'use strict';

define(['angular','require'], function(angular, require) {
  var app = angular.module('portal.features.controllers', []);


  app.controller('PortalFeaturesController', ['miscService', '$localStorage', '$sessionStorage', '$scope', '$document', 'FEATURES',
    '$mdDialog', 'portalFeaturesService', '$sanitize', 'MISC_URLS',
    function(miscService, $localStorage, $sessionStorage, $scope, $document, FEATURES, $mdDialog, portalFeaturesService, $sanitize, MISC_URLS) {
      $scope.features = [];
      $scope.MISC_URLS = MISC_URLS;
      if (FEATURES.enabled) {
        portalFeaturesService.getFeatures().then(function(data) {
          var features = data;
          if (features.length > 0) {
            $scope.features = features;
          }
        });
      }
  }]);

  app.controller('PortalPopupController', ['$localStorage', '$sessionStorage', '$rootScope', '$scope', '$document', 'FEATURES',
    'filterFilter', '$filter', '$mdDialog', 'portalFeaturesService', 'miscService', '$sanitize',
    function($localStorage, $sessionStorage, $rootScope, $scope, $document, FEATURES, filterFilter, $filter, $mdDialog, portalFeaturesService, miscService, $sanitize) {
      //scope functions ---------------------------------------------------------

      //need this due to isolated scope
      $scope.pushGAEvent = function(a,b,c) {
        miscService.pushGAEvent(a,b,c);
      };

      $scope.markAnnouncementSeen = function(announcementID, liked) {
        portalFeaturesService.markAnnouncementSeen(announcementID);
        //reloadAnnouncements
        portalFeaturesService.getUnseenAnnouncements().then(function(unseenAnnouncements) {
          $scope.announcements = unseenAnnouncements;
        });
        miscService.pushGAEvent('feature',liked ? 'read more' : 'dismissed', announcementID);
      };

      $scope.markAllAnnouncementsSeen = function(liked){
        portalFeaturesService.getUnseenAnnouncements().then(function(unseenAnnouncements) {
          for(var i=0; i<unseenAnnouncements.length; i++){
            var announcement = unseenAnnouncements[i];
            portalFeaturesService.markAnnouncementSeen(announcement.id);
            miscService.pushGAEvent('feature',liked ? 'read more' : 'dismissed', announcement.id);
          }
          portalFeaturesService.getUnseenAnnouncements().then(function(newUnseenAnnouncements) {
            $scope.announcements = newUnseenAnnouncements;
          });
        });
      };

      $scope.toggleHover = function() {
        $scope.hover = $scope.hover ? false : true;
      };

      $scope.toggleActive = function() {
        $scope.active = !$scope.active;
      };

      $scope.$on("$mdMenuClose", function() {
        $scope.hover = false;
        $scope.active = false;
      });

      //local functions ---------------------------------------------------------

      var getPopups = function(){
        if (!$rootScope.GuestMode) {
          portalFeaturesService.getUnseenPopups().then(function(unseenPopups) {
            if (unseenPopups.length !=0 && !$rootScope.GuestMode) {
              var orderedPopups = $filter('orderBy')(unseenPopups, ['popup.startYear', 'popup.startMonth', 'popup.startDay', 'id']);
              $scope.latestFeature = orderedPopups[0];

              var displayPopup = function() {
                $mdDialog.show({
                  templateUrl: require.toUrl('./partials/features-dialog-template.html'),
                  parent: angular.element(document).find('div.my-uw')[0],
                  clickOutsideToClose: true,
                  openFrom: 'left',
                  closeTo: 'right',
                  preserveScope: true,
                  scope: $scope,
                  controller: function DialogController($scope, $mdDialog) {
                    $scope.closeDialog = function(action) {
                      $mdDialog.hide(action);
                    };
                  }
                })
                .then(function(action) {
                  // if dialog is closed by clicking "continue" button
                  miscService.pushGAEvent('popup', action, orderedPopups[0].id);
                  portalFeaturesService.markPopupSeen(orderedPopups[0].id);
                  getPopups();
                }, function() {
                  // if popup is closed by clicking outside or pressing escape key
                  miscService.pushGAEvent('popup', 'dismissed', orderedPopups[0].id);
                  portalFeaturesService.markPopupSeen(orderedPopups[0].id);
                  getPopups();
                });
              };
              displayPopup();
            }
          });
        }
      };

      var setMascot = function() {
        if($rootScope.portal && $rootScope.portal.theme) {
          $scope.buckyImg = $rootScope.portal.theme.mascotImg || 'img/robot-taco.gif';
        } else {
          $scope.buckyImg = 'img/robot-taco.gif';
        }
        $rootScope.$watch('portal.theme', function(newVal, oldVal) {
          if (newVal !== oldVal) {
            $scope.buckyImg = newVal.mascotImg || 'img/robot-taco.gif';
          }
        });
      };



     var init = function() {
       $scope.hover = false;
       $scope.active = false;
       if (FEATURES.enabled && !$rootScope.GuestMode) {
         //handle legacy local storage #deleteIt
         delete $localStorage.lastSeenFeature;
         delete $localStorage.hasSeenWelcome;
         //Mode is set to bucky or bucky_mobile to signal mascot init of controller
         if(("BUCKY" === $scope.mode || "BUCKY_MOBILE" === $scope.mode)
            && !$rootScope.GuestMode) {
           portalFeaturesService.getUnseenAnnouncements().then(function(unseenAnnouncements) {
             if(!$rootScope.GuestMode){
               $scope.announcements = unseenAnnouncements;
             }
           });
           setMascot();
         }else{
           getPopups();
         }
       }
    };

    //run function -------------------------------------------------------------
    init();

  }]);

  return app;
});
