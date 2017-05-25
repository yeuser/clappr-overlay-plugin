// var UiContainerPlugin = require('UIContainerPlugin');
var JST = require('./jst');

class OverlayButtons extends Clappr.UIContainerPlugin {
  get name() {
    return 'overlay_buttons'
  }

  render() {
    console.log("rendering", this.name)
    var style = $('<style>').html(JST.CSS[this.name])
    this.$el.append(style)
    return this;
  }

}

module.exports = window.OverlayButtons = OverlayButtons;
