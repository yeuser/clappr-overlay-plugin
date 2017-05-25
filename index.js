// var UiContainerPlugin = require('UIContainerPlugin');
var JST = require('./jst');
var css = require('css');

class OverlayButtons extends Clappr.UIContainerPlugin {
  get name() {
    return 'overlay_buttons'
  }

  initialize() {
    this.render();
  }

  bindEvents() {
    this.listenTo(this.container, Clappr.Events.CONTAINER_PAUSE, this.show);
    this.listenTo(this.container, Clappr.Events.CONTAINER_PLAY, this.hide);
    this.listenTo(this.container, Clappr.Events.CONTAINER_READY, this.render)
  }

  hide() {
    this.$el.hide();
  }

  show() {
    this.$el.show();
  }

  render() {
    this.$el.html(JST.overlay_buttons());
    let $el = this.$el;
    css.parse(JST.CSS.overlay_buttons, {compress: true}).stylesheet.rules.forEach(function (rule) {
      let elem = $el.find("div.clappr-overlay-container");
      rule.declarations.forEach(function (declaration) {
        elem.css(declaration.property, declaration.value);
      });
    });
    // this.$el.css('color', 'white');
    // this.$el.css('background-color', 'red');
    // this.$el.css('position', 'relative');
    this.container.$el.append(this.$el);
    this.hide();
    return this;
  }
}

module.exports = window.OverlayButtons = OverlayButtons;
