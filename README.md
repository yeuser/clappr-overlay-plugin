# Clappr Overlay Plugin
This plugin is created for the Clappr HTML video player.
It works as a configurable overlay.

## Usage:
```javascript
var player = new Clappr.Player({
      plugins: {
        container: [OverlayButtons]
      },
      OverlayButtons: {
        schedule: [
                  {
                    start: 60,
                    limit: 1,
                    rows: [
                      {
                        height: .41,
                        cols: [{
                          width: .9,
                          text: "آیا این خوب بود؟",
                          style :{
                            background:'#a15',
                          }
                        }],
                        style :{
                          background:'#1b1',
                        }
                      },
                      {
                        height: .41,
                        cols: [
                          {
                            width: .3,
                            text: "بله خوبه!",
                            isButton: true,
                            run: () => {
                              console.log('yes', arguments);
                              return true;
                            },
                            style :{
                              background:'#001',
                            },
                            styleHover :{
                              background:'#fff',
                            }
                          },
                          {
                            width: .3,
                            text: "خیر خوب نیست!",
                            isButton: true,
                            run: () => {
                              console.log('no', arguments);
                              return true;
                            }
                          }
                        ]
                      }
                    ],
                    style :{
                        background:'#115',
                    }
                  },
                  {
                    start: 120,
                    wait: 10,
                    limit: 1,
                    rows: [
                      {
                        height: .41,
                        cols: [{
                          width: .9,
                          text: "آیا این خوب بود؟"
                        }]
                      },
                      {
                        height: .41,
                        cols: [
                          {
                            width: .3,
                            text: "بله خوبه!",
                            isButton: true,
                            run: () => {
                              console.log('yes', arguments);
                              return true;
                            }
                          },
                          {
                            width: .3,
                            text: "خیر خوب نیست!",
                            isButton: true,
                            run: () => {
                              console.log('no', arguments);
                              return true;
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
      }
    });
```
