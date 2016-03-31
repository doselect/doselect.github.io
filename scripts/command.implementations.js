angular.module('ng-terminal-example.command.implementations', ['ng-terminal-example.command.tools'])

  .config(['commandBrokerProvider', function (commandBrokerProvider) {
    commandBrokerProvider.appendCommandHandler({
      command: 'version',
      description: ['Displays DWS CLI Version.'],
      handle: function (session) {
        session.output.push({ output: true, text: ['v0.1.0'], breakLine: true })
      }
    })

    commandBrokerProvider.appendCommandHandler({
      command: 'clear',
      description: ['Clears the screen'],
      handle: function (session) {
        session.commands.push({ command: 'clear' })
      }
    })

    commandBrokerProvider.appendCommandHandler({
      command: 'cat',
      description: ['Meh! Obvious!'],
      handle: function (session) {
        session.commands.push({ command: 'cat' })

        // Cat
        new Audio('assets/cat-meow.mp3').play() 
        var a =  [' ','           /\\-/\\                ',
                      '          /a a  \\                                 _                ',
                      '         =\\ Y  =/-~~~~~~-,_______________________/ )                ',
                      '           `^--`          ________________________/                ',
                      '             \\           /                ',
                      '             ||  |---`\\  \\                   ',
                      '            (_(__|   ((__|                 ', ' ']
        session.output.push({ output: true, text: [a.join('\n')]})

      }
    })

    commandBrokerProvider.appendCommandHandler({
      command: 'date',
      description: ['Displays the current date and time'],
      handle: function (session) {
        var a = [Date()]
        session.output.push({ output: true, text: [a.join(' ')], breakLine: true })
      }
    })

    commandBrokerProvider.appendCommandHandler({
      command: 'ifconfig',
      description: ['Displays the wireless network configuration'],
      handle: function (session) {
        var a = [' ', ' enp2s0    no wireless extensions.                                   ',
                      ' docker0   no wireless extensions.                                   ',
                      ' lo        no wireless extensions.                                   ',
                      ' wlp3s0    IEEE 802.11bgn  ESSID:"Random 223e"                                     ',
                      '           Mode:Managed  Frequency:2.457 GHz  Access Point: C1:3A:3E:2F:B0:95                                      ',
                      '           Bit Rate=225 Mb/s   Tx-Power=15 dBm                                      ',
                      '           Retry short limit:7   RTS thr:off   Fragment thr:off                                   ',
                      '           Power Management:off                                   ',
                      '           Link Quality=65/70  Signal level=-45 dBm                                     ',
                      '           Rx invalid nwid:0  Rx invalid crypt:0  Rx invalid frag:0                                   ',
                      '           Tx excessive retries:0  Invalid misc:45   Missed beacon:0                                   ']
        session.output.push({ output: true, text: [a.join('\n')]})
      }
    })

    commandBrokerProvider.appendCommandHandler({
      command: 'uname',
      description: ['Displays system information'],
      handle: function (session) {
        var a = ['Linux']
        session.output.push({ output: true, text: [a.join(' ')], breakLine: true })
      }
    })

    commandBrokerProvider.appendCommandHandler({
      command: 'who',
      description: ['Displays effective userid'],
      handle: function (session) {
        var a = ['user2dfe  tty1         ', Date()]
        session.output.push({ output: true, text: [a.join(' ')], breakLine: true })
      }
    })

    commandBrokerProvider.appendCommandHandler({
      command: 'whoami',
      description: ['Displays effective userid'],
      handle: function (session) {
        var a = ['user2dfe']
        session.output.push({ output: true, text: [a.join(' ')], breakLine: true })
      }
    })

    commandBrokerProvider.appendCommandHandler({
      command: 'free',
      description: ['Displays amount of free and used memory in the system'],
      handle: function (session) {
        var a = ['user2dfe']
        session.output.push({ output: true, text: [a.join(' ')], breakLine: true })
      }
    })

    commandBrokerProvider.appendCommandHandler({
      command: 'break',
      description: ['Tests how commands are broken down in segments.', "Example: break 'foo bar' baz foo"],
      handle: function (session) {
        var a = Array.prototype.slice.call(arguments, 1)
        session.output.push({ output: true, text: a, breakLine: true })
      }
    })

    commandBrokerProvider.appendCommandHandler({
      command: 'websocket',
      description: ['Starts a websocket session.',
        'Syntax: websocket <url> [protocol]',
        'Example: websocket wss://echo.websocket.org'],
      handle: function (session, url, protocol) {
        if (!url) {
          throw new Error("The parameter 'url' is required, type 'help websocket' to get help.")
        }

        session.output.push({
          output: true,
          text: ['Openning connection to ' + url + (protocol ? ' with protocol ' + protocol : '') + ' ...',
            "Type 'exit' to exit."],
          breakLine: true
        })
        session.commands.push({ command: 'change-prompt', prompt: { path: 'websocket[' + url + ']'} })
        session.contextName = 'websocket'
        session.context = function () {
          var me = {}
          var ws = protocol ? new WebSocket(url, protocol) : new WebSocket(url)
          ws.onopen = function () {
            session.output.push({ output: true, text: ['Connection established.'], breakLine: true })
            session.$scope.$apply()
          }

          ws.onerror = function () {
            session.output.push({ output: true, text: ['Connection error.'], breakLine: true })
            session.$scope.$apply()
            me.execute(session, 'exit')
          }

          ws.onmessage = function (msg) {
            session.output.push({ output: true, text: [msg.data], breakLine: true })
            session.$scope.$apply()
          }

          me.execute = function (s, c) {
            if (c == 'exit') {
              ws.close()
              s.contextName = ''
              delete s.context
              s.commands.push({ command: 'reset-prompt', prompt: {path: true} })
              s.output.push({ output: true, text: ['Websocket ended.'], breakLine: true })
              return
            }
            ws.send(c)
          }
          return me
        }()
      }
    })

    var suCommandHandler = function () {
      var me = {}
      var ga = null
      me.command = 'su'
      me.description = ['Changes the  user identity.', 'Syntax: su <userName>', 'Example: su adam']
      me.init = ['$ga', function ($ga) {
        ga = $ga
      }]
      me.handle = function (session, login) {
        if (!login) {
          session.output.push({ output: true, text: ['The <userName> parameter is required.', "Type 'help su' to get a hint."], breakLine: true })
          return
        }

        ga('set', { userId: login.toString() })
        session.login = login
        session.commands.push({ command: 'change-prompt', prompt: { user: login }})
        session.output.push({ output: true, text: ['Identity changed.'], breakLine: true })
      }
      return me
    }
    commandBrokerProvider.appendCommandHandler(suCommandHandler())

    var feedbackCommandHandler = function () {
      var me = {}
      var _ga = null
      me.command = 'feedback'
      me.description = ['Sends a feedback message to DWS Support team']
      me.init = ['$ga', function ($ga) {
        _ga = $ga
      }]
      me.handle = function (session, param) {
        param = Array.prototype.slice.call(arguments, 1)
        param = param.join(' ')
        var outText = []
        if (!param) {
          outText.push("You need to provide a message")
        } else {
          outText.push('Your message have been sent.')
          outText.push('Thanks for the feedback!.')
          _ga('send', 'event', 'Console', 'Feedback', param)
        }
        session.output.push({ output: true, text: outText, breakLine: true })
      }
      return me
    }
    commandBrokerProvider.appendCommandHandler(feedbackCommandHandler())

    // this must be the last
    var helpCommandHandler = function () {
      var me = {}

      me.command = 'help'
      me.description = ['Provides instructions about how to use this terminal']
      me.handle = function (session, cmd) {
        var list = commandBrokerProvider.describe()
        var outText = []
        if (cmd) {
          for (var i = 0; i < list.length; i++) {
            if (list[i].command == cmd) {
              var l = list[i]
              outText.push('Command help for: ' + cmd)
              for (var j = 0; j < l.description.length; j++) {
                outText.push(l.description[j])
              }
              break
            }
          }
          if (!outText.length)
            outText.push('There is no command help for: ' + cmd)
        } else {
          outText.push('Available commands:')
          for (var i = 0; i < list.length; i++) {
            outText.push(list[i].command + '\n')
          }
          outText.push('')
          outText.push("Enter 'help <command>' to get help for a particular command.")
        }
        session.output.push({ output: true, text: outText, breakLine: true })
      }
      return me
    }
    commandBrokerProvider.appendCommandHandler(helpCommandHandler())
  }])
