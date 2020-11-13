(function () {
    var testTool = window.testTool;
    // get meeting args from url
    var tmpArgs = testTool.parseQuery();
    var meetingConfig = {
      apiKey: tmpArgs.apiKey,
      meetingNumber: tmpArgs.mn,
      userName: (function () {
        if (tmpArgs.name) {
          try {
            return testTool.b64DecodeUnicode(tmpArgs.name);
          } catch (e) {
            return tmpArgs.name;
          }
        }
        return (
          "CDN#" +
          tmpArgs.version +
          "#" +
          testTool.detectOS() +
          "#" +
          testTool.getBrowserInfo()
        );
      })(),
      passWord: tmpArgs.pwd,
      leaveUrl: "/index.html",
      userEmail: (function () {
        try {
          return testTool.b64DecodeUnicode(tmpArgs.email);
        } catch (e) {
          return tmpArgs.email;
        }
      })(),
      lang: tmpArgs.lang,
      signature: tmpArgs.signature || "",
    };
  
    // a tool use debug mobile device
    if (testTool.isMobileDevice()) {
      vConsole = new VConsole();
    }
    console.log(JSON.stringify(ZoomMtg.checkSystemRequirements()));

    /*
    function addcss(css){
      var head = document.getElementsByTagName('head')[0];
      var s = document.createElement('style');
      s.setAttribute('type', 'text/css');
      if (s.styleSheet) {   // IE
          s.styleSheet.cssText = css;
      } else {                // the world
          s.appendChild(document.createTextNode(css));
      }
      head.appendChild(s);
   }

    if(meetingConfig.type === "DEMO") {
      addcss(".send-video-container {display: none;}");
    }
    */
  
    // it's option if you want to change the WebSDK dependency link resources. setZoomJSLib must be run at first
    // ZoomMtg.setZoomJSLib("https://source.zoom.us/1.8.1/lib", "/av"); // CDN version defaul

    ZoomMtg.preLoadWasm();
    ZoomMtg.prepareJssdk();
    function beginJoin(signature) {
      ZoomMtg.init({
        leaveUrl: meetingConfig.leaveUrl,
        webEndpoint: meetingConfig.webEndpoint,
        isSupportAV: true, //optional,
        isSupportChat: false, //optional,
        isSupportQA: false, //optional,
        isSupportCC: false, //optional,
        screenShare: true, //optional,
        sharingMode: 'both',
        disableInvite: true, //optional
        disableRecord: false, //optional
        audioPanelAlwaysOpen: false,
        success: function () {
          console.log(meetingConfig);
          console.log("signature", signature);
          $.i18n.reload(meetingConfig.lang);
          ZoomMtg.join({
            meetingNumber: meetingConfig.meetingNumber,
            userName: meetingConfig.userName,
            signature: signature,
            apiKey: meetingConfig.apiKey,
            userEmail: meetingConfig.userEmail,
            passWord: meetingConfig.passWord,
            success: function (res) {
              console.log("join meeting success");
              console.log("get attendeelist");
              ZoomMtg.getAttendeeslist({});
              ZoomMtg.getCurrentUser({
                success: function (res) {
                  console.log("success getCurrentUser", res.result.currentUser);
                },
              });
            },
            error: function (res) {
              console.error(res);
            },
          });
        },
        error: function (res) {
          console.error(res);
        },
      });
  
      ZoomMtg.inMeetingServiceListener('onUserJoin', function (data) {
        console.log('inMeetingServiceListener onUserJoin', "*", data);
        parent.postMessage({source: "FROM_ZOOM_CLIENT", data}, "*");
      });
  
      ZoomMtg.inMeetingServiceListener('onUserLeave', function (data) {
        console.log('inMeetingServiceListener onUserLeave', "*", data);
        parent.postMessage({source: "FROM_ZOOM_CLIENT", data}, "*");
      });
  
      ZoomMtg.inMeetingServiceListener('onUserIsInWaitingRoom', function (data) {
        console.log('inMeetingServiceListener onUserIsInWaitingRoom', data);
        parent.postMessage({source: "FROM_ZOOM_CLIENT", data}, '*');
      });
  
      ZoomMtg.inMeetingServiceListener('onMeetingStatus', function (data) {
        console.log('inMeetingServiceListener onMeetingStatus', data);
        parent.postMessage({source: "FROM_ZOOM_CLIENT", data}, '*');
      });
    }
  
    beginJoin(meetingConfig.signature);
  })();
  