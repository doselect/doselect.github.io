angular.module('dws', ['vtortola.ng-terminal'])

  .config(['terminalConfigurationProvider', function (terminalConfigurationProvider) {
    terminalConfigurationProvider.config('modern').outputDelay = 10
    terminalConfigurationProvider.config('modern').allowTypingWriteDisplaying = false
  }])

  .controller('terminalCtrl', ['$scope', '$rootScope',
    function ($scope, $rootScope) {
      $rootScope.theme = 'modern'

    setTimeout(function () {
      $scope.$broadcast('terminal-output', {
        output: true,
        text: ['Welcome to DoSelect Web Services CLI',
               'Usage: dws [options] <command> <subcommand> [parameters]'],
        breakLine: true
      })
      $scope.$apply()
    }, 100)
  }])
