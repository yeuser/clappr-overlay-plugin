const JST = require('./jst');
const css = require('css');

class OverlayButtons extends Clappr.UIContainerPlugin {
  constructor(core) {
    super(core);
    this._options = Zepto.extend({}, this.options.OverlayButtons);
    this.render();
  }

  static get name() {
    return 'overlay_buttons'
  }

  bindEvents() {
    this.listenTo(this.container, Clappr.Events.CONTAINER_TIMEUPDATE, this.timeUpdated);
  }

  timeUpdated(timeProgress) {
    let currentSecond = Math.floor(timeProgress.current);
    this._options.schedules.tabular.filter(s => s.start > currentSecond || s.start + 1 <= currentSecond).forEach(s => {
      s.showing = false;
      s.justShown = false;
      this._layouts[s.index].hide();
    });
    this._options.schedules.tabular.filter(s => s.start <= currentSecond && s.start + 1 > currentSecond).filter(s => !s.justShown).forEach(s => {
      this.$el.find(".clappr-overlay-timer").hide();
      if (s.limit > 0) s.limit -= 1;
      s.showing = true;
      s.justShown = true;
      this._layouts[s.index].show();
      this.container.playback.pause();
      this.container.disableMediaControl();
      const that = this;
      window.setTimeout(() => that.container.disableMediaControl(), 100);
      if (s.wait > 0) {
        const wait_time = s.wait * 1000;
        const end_time = new Date().getTime() + wait_time;
        this.$el.find(".clappr-overlay-timer .pie .quarter-circle").show();
        this.$el.find(".clappr-overlay-timer .pie").css('clip', '');
        let $el = this.$el;
        css.parse(JST.CSS.overlay_buttons, {compress: true}).stylesheet.rules.forEach(rule =>
          rule.selectors.filter(s => s.startsWith('div.clappr-overlay-timer .pie .') && s.endsWith('-side')).forEach(selector => {
            let elem = $el.find(selector);
            rule.declarations.forEach(declaration => elem.css(declaration.property, declaration.value));
          }));
        let hidden_quarters = {};
        let intervalFun = () => {
          const remaining_waiting_time = end_time - new Date().getTime();
          if (remaining_waiting_time <= 0) {
            that._playOn();
            return;
          }
          this.$el.find(".clappr-overlay-timer .label span").text(Math.ceil(remaining_waiting_time / 1000.0));
          const ratio = remaining_waiting_time / wait_time;
          if (ratio > 0.75) {
            const deg = (ratio - 0.75) * 360 + 180;
            this.$el.find(".clappr-overlay-timer .pie .top-left-side").css('-webkit-transform', 'rotate(' + deg + 'deg)');
            this.$el.find(".clappr-overlay-timer .pie .top-left-side").css('transform', 'rotate(' + deg + 'deg)');
          } else if (ratio > 0.5) {
            if (!hidden_quarters['top-left']) {
              this.$el.find(".clappr-overlay-timer .pie .top-left-side").hide();
              hidden_quarters['top-left'] = true;
            }
            const deg = (ratio - 0.5) * 360 + 90;
            this.$el.find(".clappr-overlay-timer .pie .bottom-left-side").css('-webkit-transform', 'rotate(' + deg + 'deg)');
            this.$el.find(".clappr-overlay-timer .pie .bottom-left-side").css('transform', 'rotate(' + deg + 'deg)');
          } else if (ratio > 0.25) {
            if (!hidden_quarters['top-left']) {
              this.$el.find(".clappr-overlay-timer .pie .top-left-side").hide();
              hidden_quarters['top-left'] = true;
            }
            if (!hidden_quarters['bottom-left']) {
              this.$el.find(".clappr-overlay-timer .pie .bottom-left-side").hide();
              hidden_quarters['bottom-left'] = true;
            }
            const deg = (ratio - 0.25) * 360;
            this.$el.find(".clappr-overlay-timer .pie .bottom-right-side").css('-webkit-transform', 'rotate(' + deg + 'deg)');
            this.$el.find(".clappr-overlay-timer .pie .bottom-right-side").css('transform', 'rotate(' + deg + 'deg)');
          } else {
            if (!hidden_quarters['top-left']) {
              this.$el.find(".clappr-overlay-timer .pie .top-left-side").hide();
              hidden_quarters['top-left'] = true;
            }
            if (!hidden_quarters['bottom-left']) {
              this.$el.find(".clappr-overlay-timer .pie .bottom-left-side").hide();
              hidden_quarters['bottom-left'] = true;
            }
            if (!hidden_quarters['bottom-right']) {
              this.$el.find(".clappr-overlay-timer .pie .bottom-right-side").hide();
              hidden_quarters['bottom-right'] = true;
            }
            this.$el.find(".clappr-overlay-timer .pie").css('clip', 'rect(-0.15em 2.55em 2.55em 1.16em);');
            const deg = ratio * 360 - 90;
            this.$el.find(".clappr-overlay-timer .pie .top-right-side").css('-webkit-transform', 'rotate(' + deg + 'deg)');
            this.$el.find(".clappr-overlay-timer .pie .top-right-side").css('transform', 'rotate(' + deg + 'deg)');
          }
          this._scheduled = window.setTimeout(() => intervalFun(), 100);
        };
        this.$el.find(".clappr-overlay-timer").show();
        intervalFun();
      }
    });

    this._options.schedules.cellular.filter(s => s.start <= timeProgress.current && s.end >= timeProgress.current).forEach(s => {
      if (s.limit > 0) s.limit -= 1;
      this._layouts[s.index].show();
    });
    this._options.schedules.cellular.filter(s => s.start > timeProgress.current || s.end < timeProgress.current).forEach(s => {
      this._layouts[s.index].hide();
    });
    let showTabular = this._options.schedules.tabular.filter(s => s.showing).length > 0;
    let showCellular = this._options.schedules.cellular.filter(s => s.start <= timeProgress.current && s.end >= timeProgress.current).length > 0;
    if (showTabular || showCellular) this.$el.show(); else this.$el.hide();
    if (showTabular) this.$el.find(".clappr-overlay").show(); else this.$el.find(".clappr-overlay").hide();
    if (showCellular) this.$el.find(".clappr-overlay-fixed").show(); else this.$el.find(".clappr-overlay-fixed").hide();
  }

  _playOn() {
    this._options.schedules.tabular.filter(s => s.showing).forEach(s => s.showing = false);
    this._options.schedules.tabular = this._options.schedules.tabular.filter(s => s.limit != 0);
    if (this._scheduled) window.clearTimeout(this._scheduled);
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
        container.append(Zepto(defaultElementHtml)
          .css(dim, pad * 100. / sum + '%'));
        let itemEl = Zepto(defaultElementHtml)
          .css(dim, item[dim] * 100. / sum + '%');
        let itemElemInner = Zepto(defaultElementHtml)
          .css(dim, '100%');
        itemEl.append(itemElemInner);
        applyStyles(itemEl, item.style);
        container.append(itemEl);
        if (callback) callback(item, itemElemInner);
      });
    }

    const that = this;

    let layoutOptions = {};
    this._options.schedule.forEach(schedule => {
      schedule.showing = false;
      if (!schedule.limit || schedule.limit < 0)
        schedule.limit = -1;
      else if (schedule.limit >= 1)
        schedule.limit = Math.floor(schedule.limit);
      schedule.start = Math.floor(schedule.start);
      schedule.wait = schedule.wait || -1;
      schedule.end = schedule.end || +(schedule.start) + 1;
      if (!layoutOptions[schedule.start])
        layoutOptions[schedule.start] = schedule;
      else
        console.error("duplicate start-time:" + schedule.start)
    });

    this._options.schedules = {cellular: [], tabular: []};
    let index = 0;
    for (let k in layoutOptions) {
      layoutOptions[k].index = index++;
      this._options.schedules[layoutOptions[k].layout == 'cellular' ? 'cellular' : 'tabular'].push(layoutOptions[k]);
    }
    for (let k in layoutOptions)
      layoutOptions[k].index = index++;

    let layouts = this._layouts = [];

    let containerP = this.$el.find(".clappr-overlay-container");
    let container = Zepto(defaultElementHtml);
    containerP.append(container);
    this._options.schedules.tabular.forEach(schedule => {
      let elmContainer = Zepto(defaultElementHtml);
      container.append(elmContainer);
      layouts[schedule.index] = elmContainer;
      applyStyles(container, schedule.style);
      mkDivisions(elmContainer, 'height', schedule.rows, (row, rowInner) => {
        mkDivisions(rowInner, 'width', row.cols, (item, container) => {
          if (item.html)
            container.append(Zepto(item.html));
          else {
            let elem = Zepto("<div style='display:inline-block;float:left;font-size:20px;position:relative;direction:rtl;top:50%;left:50%;transform:translate(-50%,-50%)'></div>");
            container.append(elem);
            elem.text(item.text);
          }
          if (item.isButton && item.run) {
            container.css('cursor', 'pointer');
            container.click(e => {
              let run = item.run(that.container);
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

    let containerFixed = this.$el.find(".clappr-overlay-fixed");
    this._options.schedules.cellular.forEach(cellsOpt => {
      let elmContainer = Zepto("<div></div>");
      containerFixed.append(elmContainer);
      layouts[cellsOpt.index] = elmContainer;
      elmContainer.hide();

      cellsOpt.cells.forEach(item => {
        let cellElm = Zepto("<div style='position:fixed;width:100%;height:100%;left:0;top:0;display:block;float:none;clear:both;z-index:1000'></div>");
        elmContainer.append(cellElm);
        for (let attr of ['width', 'height', 'left', 'top'])
          if (item[attr])
            cellElm.css(attr, (item[attr] * 100) + '%');
        let cellElmInner = Zepto(defaultElementHtml);
        cellElm.append(cellElmInner);
        if (item.html)
          cellElmInner.append(Zepto(item.html));
        else {
          let elem = Zepto("<div style='display:inline-block;float:left;font-size:20px;position:relative;direction:rtl;top:50%;left:50%;transform:translate(-50%,-50%)'></div>");
          cellElmInner.append(elem);
          elem.text(item.text);
        }
        applyStyles(cellElm, item.style);
        if (item.isButton && item.run) {
          cellElm.css('cursor', 'pointer');
          cellElm.click(e => {
            let run = item.run(that.container);
            if (run === undefined || !!run) that._playOn();
          });
          cellElm.mouseenter(e => {
            cellElm.css('border', 'white').css('background', 'lightgray');
            applyStyles(container, item.styleHover);
          });
          cellElm.mouseleave(e => {
            cellElm.css('border', '').css('background', '');
            removeStyles(container, item.styleHover);
            applyStyles(container, item.style);
          });
        }
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
