/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview This event handler will dispatch events when
 * `navigator.onLine` changes.  HTML5 defines two events, online and
 * offline that is fired on the window.  As of today 3 browsers support these
 * events: Firefox 3 (Gecko 1.9), Opera 9.5, and IE8.  If we have any of these
 * we listen to the 'online' and 'offline' events on the current window
 * object.  Otherwise we poll the navigator.onLine property to detect changes.
 *
 * Note that this class only reflects what the browser tells us and this usually
 * only reflects changes to the File -> Work Offline menu item.
 *
 * @see ../demos/onlinehandler.html
 */

// TODO(arv): We should probably implement some kind of polling service and/or
// a poll for changes event handler that can be used to fire events when a state
// changes.

goog.provide('goog.events.OnlineHandler');
goog.provide('goog.events.OnlineHandler.EventType');

goog.require('goog.Timer');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.net.NetworkStatusMonitor');



/**
 * Basic object for detecting whether the online state changes.
 * @constructor
 * @extends {goog.events.EventTarget}
 * @implements {goog.net.NetworkStatusMonitor}
 */
goog.events.OnlineHandler = function() {
  'use strict';
  goog.events.OnlineHandler.base(this, 'constructor');

  /**
   * @private {goog.events.EventHandler<!goog.events.OnlineHandler>}
   */
  this.eventHandler_ = new goog.events.EventHandler(this);

  this.eventHandler_.listen(
      window, [goog.events.EventType.ONLINE, goog.events.EventType.OFFLINE],
      this.handleChange_);
};
goog.inherits(goog.events.OnlineHandler, goog.events.EventTarget);


/**
 * Enum for the events dispatched by the OnlineHandler.
 * @enum {string}
 * @deprecated Use goog.net.NetworkStatusMonitor.EventType instead.
 */
goog.events.OnlineHandler.EventType = goog.net.NetworkStatusMonitor.EventType;


/**
 * The time to wait before checking the `navigator.onLine` again.
 * @type {number}
 * @private
 */
goog.events.OnlineHandler.POLL_INTERVAL_ = 250;


/**
 * Stores the last value of the online state so we can detect if this has
 * changed.
 * @type {boolean}
 * @private
 */
goog.events.OnlineHandler.prototype.online_;


/**
 * The timer object used to poll the online state.
 * @type {goog.Timer}
 * @private
 */
goog.events.OnlineHandler.prototype.timer_;


/** @override */
goog.events.OnlineHandler.prototype.isOnline = function() {
  'use strict';
  return navigator.onLine;
};


/**
 * Called every time the timer ticks to see if the state has changed and when
 * the online state changes the method handleChange_ is called.
 * @private
 */
goog.events.OnlineHandler.prototype.handleTick_ = function() {
  'use strict';
  var online = this.isOnline();
  if (online != this.online_) {
    this.online_ = online;
    this.handleChange_();
  }
};


/**
 * Called when the online state changes.  This dispatches the
 * `ONLINE` and `OFFLINE` events respectively.
 * @private
 */
goog.events.OnlineHandler.prototype.handleChange_ = function() {
  'use strict';
  var type = this.isOnline() ? goog.net.NetworkStatusMonitor.EventType.ONLINE :
                               goog.net.NetworkStatusMonitor.EventType.OFFLINE;
  this.dispatchEvent(type);
};


/** @override */
goog.events.OnlineHandler.prototype.disposeInternal = function() {
  'use strict';
  goog.events.OnlineHandler.base(this, 'disposeInternal');
  this.eventHandler_.dispose();
  this.eventHandler_ = null;
  if (this.timer_) {
    this.timer_.dispose();
    this.timer_ = null;
  }
};
