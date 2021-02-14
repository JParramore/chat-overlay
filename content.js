console.log('script start')

// function injectScript(file, node) {
//     var th = document.getElementsByTagName(node)[0]
//     var s = document.createElement('script')
//     s.setAttribute('type', 'text/javascript')
//     s.setAttribute('src', file)
//     th.appendChild(s)
// }

// injectScript(chrome.extension.getURL('/test.js'), 'body')

window.onload = () => {
    //const datad = document.getElementById('video-data_oc')
    //console.log(JSON.parse(datad.innerHTML))

    // let data,
    //     vodID,
    //     channelName,
    //     pathname = window.location.pathname.substr(1)
    // playerType = 'site'

    // pathname.startsWith('videos/')
    //     ? (vodID = (vodID = pathname
    //           .replace('videos/', '')
    //           .replace(/\//g, '')).startsWith('v')
    //           ? vodID.substr(1)
    //           : vodID)
    //     : (channelName = pathname.replace(/\//g, ''))
    // if (vodID) {
    //     var body = {
    //         variables: {
    //             isLive: !1,
    //             login: '',
    //             isVod: !0,
    //             vodID: vodID,
    //             playerType: playerType,
    //         },
    //     }

    //     data = {
    //         contentType: 'vod',
    //         id: vodID,
    //         playerType: playerType,
    //         variables: body,
    //     }
    // } else if (channelName) {
    //     body = {
    //         variables: {
    //             isLive: !0,
    //             login: channelName,
    //             isVod: !1,
    //             vodID: '',
    //             playerType: playerType,
    //         },
    //     }

    //     data = {
    //         contentType: 'live',
    //         id: channelName,
    //         playerType: playerType,
    //         variables: body,
    //     }
    // }

    try {
        var defaultSpadeEndpoint = 'https://spade.twitch.tv/track'
        window.__twilightBuildID = '91e7c322-9d43-4ddf-8035-edf98b31c86a'
        for (
            var entries = document.cookie.split('; '),
                cookies = {},
                i = entries.length - 1;
            0 <= i;
            i--
        ) {
            var entry = entries[i].split('=', 2)
            cookies[entry[0]] = entry[1]
        }
        function fetchlike(a) {
            return 'function' == typeof fetch
                ? fetch('https://gql.twitch.tv/gql', a)
                : new Promise(function (e, t) {
                      var o = new XMLHttpRequest()
                      o.open('POST', 'https://gql.twitch.tv/gql'),
                          Object.keys(a.headers).forEach(function (e) {
                              try {
                                  o.setRequestHeader(e, a.headers[e])
                              } catch (e) {
                                  console.error(e)
                              }
                          }),
                          (o.withCredentials = 'include' === a.credentials),
                          (o.onerror = t),
                          (o.onload = function () {
                              var a = {
                                  status: o.status,
                                  statusText: o.statusText,
                                  body: o.response || o.responseText,
                                  ok: 200 <= o.status && o.status < 300,
                                  json: function () {
                                      return new Promise(function (e, t) {
                                          try {
                                              e(JSON.parse(a.body))
                                          } catch (e) {
                                              t(e)
                                          }
                                      })
                                  },
                              }
                              e(a)
                          }),
                          o.send(a.body)
                  })
        }
        var datatest,
            vodID,
            channelName,
            playerType = 'site',
            authorization = cookies['auth-token']
                ? 'OAuth ' + cookies['auth-token']
                : void 0,
            commonOptions = {
                method: 'POST',
                headers: {
                    'Accept-Language': 'en-US',
                    Accept: '*/*',
                    Authorization: authorization,
                    'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
                    'Content-Type': 'text/plain; charset=UTF-8',
                    'Device-ID': cookies.unique_id,
                },
            },
            playerRoutesExact =
                (window.__twilightSettings &&
                    window.__twilightSettings.player_routes_exact) ||
                [],
            playerRoutesStartsWith =
                (window.__twilightSettings &&
                    window.__twilightSettings.player_routes_startswith) ||
                [],
            pathname = window.location.pathname.substr(1)
        ;-1 === playerRoutesExact.indexOf(pathname) &&
            0 ===
                playerRoutesStartsWith.filter(function (e) {
                    return pathname.startsWith(e)
                }).length &&
            (pathname.startsWith('videos/')
                ? (vodID = (vodID = pathname
                      .replace('videos/', '')
                      .replace(/\//g, '')).startsWith('v')
                      ? vodID.substr(1)
                      : vodID)
                : (channelName = pathname.replace(/\//g, '')))
        var query =
                'query PlaybackAccessToken_Template($login: String!, $isLive: Boolean!, $vodID: ID!, $isVod: Boolean!, $playerType: String!) {  streamPlaybackAccessToken(channelName: $login, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isLive) {    value    signature    __typename  }  videoPlaybackAccessToken(id: $vodID, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isVod) {    value    signature    __typename  }}',
            bodyBase = {
                operationName: 'PlaybackAccessToken_Template',
                query: query,
            }
        if (vodID) {
            var body = JSON.stringify(
                Object.assign({}, bodyBase, {
                    variables: {
                        isLive: !1,
                        login: '',
                        isVod: !0,
                        vodID: vodID,
                        playerType: playerType,
                    },
                })
            )
            datatest = {
                contentType: 'vod',
                id: vodID,
                playerType: playerType,
                request: fetchlike(
                    Object.assign({}, commonOptions, { body: body })
                ),
            }
        } else if (channelName) {
            body = JSON.stringify(
                Object.assign({}, bodyBase, {
                    variables: {
                        isLive: !0,
                        login: channelName,
                        isVod: !1,
                        vodID: '',
                        playerType: playerType,
                    },
                })
            )
            datatest = {
                contentType: 'live',
                id: channelName,
                playerType: playerType,
                request: fetchlike(
                    Object.assign({}, commonOptions, { body: body })
                ),
            }
        }
        var blob = new Blob(
                [
                    'data=' +
                        encodeURIComponent(
                            btoa(
                                JSON.stringify({
                                    event: 'benchmark_template_loaded',
                                    properties: {
                                        app_version: window.__twilightBuildID,
                                        benchmark_server_id:
                                            cookies.server_session_id,
                                        client_time: Date.now() / 1e3,
                                        device_id: cookies.unique_id,
                                        duration: Math.round(performance.now()),
                                        url:
                                            location.protocol +
                                            '//' +
                                            location.hostname +
                                            location.pathname +
                                            location.search,
                                    },
                                })
                            )
                        ),
                ],
                { type: 'application/x-www-form-urlencoded; charset=UTF-8' }
            ),
            req = new XMLHttpRequest()
        req.open(
            'POST',
            (window.__twilightSettings && window.__twilightSettings.spade_url) ||
                defaultSpadeEndpoint,
            !0
        ),
            req.send(blob)
    } catch (e) {
        console.error('Error in bootstrap script:', e)
    }
    

   console.log(datatest)
}
console.log('script end')
