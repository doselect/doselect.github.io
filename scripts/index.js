angular.module('dws', ['vtortola.ng-terminal', 'ngMaterial', 'LocalStorageModule', 'ng-terminal-example.command.tools', 'ng-terminal-example.command.implementations', 'ng-terminal-example.command.filesystem'])
  
  .provider('$ga', function () {
    window['GoogleAnalyticsObject'] = 'ga'
    window['ga'] = window['ga'] || function () { (window['ga'].q = window['ga'].q || []).push(arguments) }
    window['ga'].l = 1 * new Date()
    var script = document.createElement('script')
    var prevScript = document.getElementsByTagName('script')[0]
    script.async = 1
    prevScript.parentNode.insertBefore(script, prevScript)

    var provider = function () {
      var me = {}

      me.$get = function () {
        ga('send', 'pageview')
        return function () {
          return window.ga.apply(window, arguments)
        }
      }

      me.ga = function () {
        return window.ga.apply(window, arguments)
      }

      return me
    }

    return provider()
  })

  .controller('terminalCtrl', ['$scope', '$ga', 'commandBroker', '$rootScope', 'localStorageService',
    function ($scope, $ga, commandBroker, $rootScope, localStorageService) {
    console.log('Joe, If you ended up here thinking there should be something hidden, Meh! We\'re not obvious humans! Dig deeper!')
    if (localStorageService.get('Ah! There you are!') == undefined) {
      localStorageService.set('Ah! There you are!', 'Check the next key')
      localStorageService.set('Come work with us!', 'https://doselect.com/job/doselect-f0n50-front-end-developer')
    }

    $rootScope.theme = 'modern'

    setTimeout(function () {
      $scope.$broadcast('terminal-output', {
        output: true,
        text: ['Welcome to DoSelect Web Services CLI',
          '',
          "Please type 'help' to open a list of commands"],
        breakLine: true
      })
      $scope.$apply()
    }, 100)

    $scope.gitHub = function () {
      $ga('send', 'event', 'ng-terminal-emulator', 'click', 'GitHub')
    }

    $scope.unitTests = function () {
      $ga('send', 'event', 'ng-terminal-emulator', 'click', 'UnitTest')
    }

    $scope.session = {
      commands: [],
      output: [],
      $scope: $scope
    }

    $scope.$watchCollection(function () { return $scope.session.commands; }, function (n) {
      for (var i = 0; i < n.length; i++) {
        $ga('send', 'event', 'Console', 'Command', JSON.stringify(n[i]))
        $scope.$broadcast('terminal-command', n[i])
      }
      $scope.session.commands.splice(0, $scope.session.commands.length)
      $scope.$$phase || $scope.$apply()
    })

    $scope.$watchCollection(function () { return $scope.session.output; }, function (n) {
      for (var i = 0; i < n.length; i++) {
        $ga('send', 'event', 'Console', 'Output', JSON.stringify(n[i]))
        $scope.$broadcast('terminal-output', n[i])
      }
      $scope.session.output.splice(0, $scope.session.output.length)
      $scope.$$phase || $scope.$apply()
    })

    $scope.$on('$viewContentLoaded', function (event) {
      $ga('send', 'pageview')
    })

    $scope.$on('terminal-input', function (e, consoleInput) {
      var cmd = consoleInput[0]

      $ga('send', 'event', 'Console', 'Input', cmd.command)
      try {
        if ($scope.session.context) {
          $scope.session.context.execute($scope.session, cmd.command)
        } else {
          commandBroker.execute($scope.session, cmd.command)
        }
      } catch (err) {
        $scope.session.output.push({ output: true, breakLine: true, text: [err.message] })
      }
    })
  }])

  .config(['$gaProvider', function ($gaProvider) {
    $gaProvider.ga('create', 'UA-75813159-1', 'auto')
  }])

  .config(['terminalConfigurationProvider', function (terminalConfigurationProvider) {
    terminalConfigurationProvider.config('modern').outputDelay = 0
    terminalConfigurationProvider.config('modern').allowTypingWriteDisplaying = false
  }])
