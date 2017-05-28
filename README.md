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
