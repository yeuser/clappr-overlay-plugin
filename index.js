// var UiContainerPlugin = require('UIContainerPlugin');
var JST = require('./jst');
var css = require('css');

class OverlayButtons extends Clappr.UIContainerPlugin {
  constructor(core) {
    super(core);
    this._options = $.extend({}, this.options.OverlayButtons);
    this.render();
  }

  static get name() {
    return 'overlay_buttons'
  }

  bindEvents() {
    // this.listenTo(this.container, Clappr.Events.CONTAINER_PAUSE, this.show);
    this.listenTo(this.container, Clappr.Events.CONTAINER_TIMEUPDATE, this.timeUpdated);
  }

  timeUpdated(timeProgress) {
    let currentSecond = Math.floor(timeProgress.current);
    this._options.schedules = this._options.schedules.filter(s => s.limit != 0);
    this._options.schedules.filter(s => s.start < currentSecond || s.start > currentSecond + 1).forEach(s => s.lock = false);
    this._options.schedules.filter(s => s.start >= currentSecond && s.start < currentSecond + 1).filter(s => !s.lock).forEach(s => {
      if (s.limit > 0) s.limit -= 1;
      s.lock = true;
      this.$el.show();
      this.container.disableMediaControl();
      this._layouts.forEach(l => l.hide());
      this._layouts[s.index].show();
      this.container.playback.pause();
      const that = this;
      if (s.wait > 0) this._scheduled = window.setTimeout(() => that._playOn(), s.wait * 1000);
    });
  }

  _playOn() {
    if (this._scheduled)
      window.clearTimeout(this._scheduled);
    this._scheduled = undefined;
    this.$el.hide();
    this.container.enableMediaControl();
    this.container.playback.play();
  }

  render() {
    const defaultElementHtml = "<div style='width:100%;height:100%;display:inline-block;float:left'></div>";
    this.$el.html(JST.overlay_buttons());
    this.$el.click(e => e.stopPropagation());
    function applyStyles(elem, style) {
      if (style)
        for (let key in style)
          if (style.hasOwnProperty(key))
            elem.css(key, style[key]);
    }

    function removeStyles(elem, style) {
      if (style)
        for (let key in style)
          if (style.hasOwnProperty(key))
            if (elem.css(key) == style[key])
              elem.css(key, '');
    }

    function mkDivisions(container, dim, list, callback) {
      let sum = 0.0;
      list.forEach(row => {
        row[dim] = (+(row[dim]) || 1.);
        sum += row[dim]
      });
      let pad = 0.0;
      if (sum < 1.) {
        pad = (1.0 - sum) / (list.length + 1);
        sum = 1.0
      }
      list.forEach(item => {
        container.append($(defaultElementHtml)
          .css(dim, pad * 100. / sum + '%'));
        let itemEl = $(defaultElementHtml)
          .css(dim, item[dim] * 100. / sum + '%');
        let itemElemInner = $(defaultElementHtml)
          .css(dim, '100%');
        itemEl.append(itemElemInner);
        applyStyles(itemEl, item.style);
        container.append(itemEl);
        if (callback) callback(item, itemElemInner);
      });
    }

    const that = this;

    let schedules = {};
    this._options.schedule.forEach(schedule => {
      schedule.lock = false;
      if (!schedule.limit)
        schedule.limit = 0;
      else if (schedule.limit < 0)
        schedule.limit = -1;
      else if (schedule.limit >= 1)
        schedule.limit = Math.floor(schedule.limit);
      schedule.start = Math.floor(schedule.start);
      schedule.wait = schedule.wait || -1;
      if (!schedules[schedule.start])
        schedules[schedule.start] = schedule;
      else
        console.error("duplicate start-time:" + schedule.start)
    });
    this._options.schedules = [];
    let index = 0;
    for (let k in schedules) {
      schedules[k].index = index++;
      this._options.schedules.push(schedules[k]);
    }

    let layouts = this._layouts = [];

    let containerP = this.$el.find(".clappr-overlay-container");
    let container = $(defaultElementHtml);
    containerP.append(container);
    this._options.schedules.forEach(schedule => {
      let elmContainer = $(defaultElementHtml);
      container.append(elmContainer);
      layouts[schedule.index] = elmContainer;
      applyStyles(container, schedule.style);
      mkDivisions(elmContainer, 'height', schedule.rows, (row, rowInner) => {
        mkDivisions(rowInner, 'width', row.cols, (item, container) => {
          let elem = $("<div style='display:inline-block;float:left;font-size:20px;position:relative;direction:rtl;top:50%;left:50%;transform:translate(-50%,-50%)'></div>");
          container.append(elem);
          elem.text(item.text);
          if (item.isButton && item.run) {
            container.css('cursor', 'pointer');
            container.click(e => {
              let run = item.run();
              if (run === undefined || !!run) that._playOn();
            });
            container.mouseenter(e => {
              container.css('border', 'white').css('background', 'lightgray');
              applyStyles(container, item.styleHover);
            });
            container.mouseleave(e => {
              container.css('border', '').css('background', '');
              removeStyles(container, item.styleHover);
              applyStyles(container, item.style);
            });
          }
        });
      });
    });

    let $el = this.$el;
    css.parse(JST.CSS.overlay_buttons, {compress: true}).stylesheet.rules.forEach(rule => rule.selectors.forEach(selector => {
      let elem = $el.find(selector);
      rule.declarations.forEach(declaration => elem.css(declaration.property, declaration.value));
    }));
    this.container.$el.append(this.$el);
    this.$el.hide();
    return this;
  }
}

module.exports = window.OverlayButtons = OverlayButtons;
