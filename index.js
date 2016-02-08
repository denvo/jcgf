/**
 * JavaScript Console Game Framework
 * by Denis Volkov (C) 2016
 *
 * Framework main class
 *
 * See LICENSE for license information
 */

'use strict';

window.JCGF = (function() {
    // Background color
    var _bgColor = '#000000';

    // Text color
    var _textColor = '#F0F0FF';

    // Font size ratio
    var _fontWidthRatio = 0.7;
    var _fontHeightRatio = 1.0;

    // Interval, ms, 0 if waiting for key pressed
    var _interval = 0;

    // Timeout object
    var _timeout = null;

    // Canvas object
    var _canvas = null;
    var _context = null;
    var _cols = 80, _rows = 40;
    var _cellWidth = 0, _cellHeight = 0;

    // Font size
    var _fontSize = 30;

    // Frame callback function
    var _frameCallback = null;

    // Pressed keys array
    var _keys = [];

    /**
     * Initializes the framework with provided step function
     *
     * @param frameCallback Function(jcgf, keys)
     *      called on each frame with params:
     *          jcgf is framework object,
     *          keys is a key pressed or array of them
     */
    var JCGF = function(frameCallback) {
        _frameCallback = frameCallback;
        init();
    };

    // Calculate canvas properties according font size and logical dimensions
    function resize() {
        _cellWidth = _fontSize * _fontWidthRatio;
        _cellHeight = _fontSize * _fontHeightRatio;
        // Resizing canvas resets font attribute
        _canvas.width = _cellWidth * _cols;
        _canvas.height = _cellHeight * _rows;
        _context.font = 'bold ' + _fontSize + 'px "Courier New"';
    }


    // Call frame callback
    function frame() {
        if(_timeout) {
            clearTimeout(_timeout);
            _timeout = null;
        }
        _frameCallback(JCGF, _interval ? _keys : (_keys ? _keys[0] : null));
        _keys = [];
        if(_interval) {
            setTimeout(frame, _interval);
        }
    }

    // Call after each key up
    function onKeyUp(event) {
        // This property is deprecated but provides the best info
        var keyId = event.keyCode;
        if(keyId) {
            _keys.push(keyId);
            // If no interval set up, call frame
            if(!_interval) {
                frame();
            }
        }
    }

    // Initizalize framework
    function init() {
        // Find canvas element
        _canvas = document.getElementById('jcgf');
        if(!_canvas || _canvas.tagName != 'CANVAS') {
            throw new Error('Canvas tag with id "jcgf" not found');
        }

        // Set up canvas
        _context = _canvas.getContext('2d');
        if(!_context) {
            throw new Error('Your browser does not support 2D canvas context');
        }
        JCGF.clear();

        // Register key press
        document.addEventListener('keyup', onKeyUp);
    }

    /**
     * Set canvas logical dimensions and clear it
     *
     * @param cols number of columns
     * @param rows number of rows
     * @param fontSize number font size in pixels
     */
    JCGF.setSize = function(cols, rows, fontSize) {
        _cols = Math.floor(cols);
        _rows = Math.floor(rows);
        _fontSize = Math.floor(fontSize);
        resize();
        JCGF.clear();
    }

    /**
     * Set frame interval
     *
     * @param interval number interval in ms between frame callback calls
     * If zero, frame callback will be called after each keyup event
     * and that key code will be passed instead of array of codes
     */
    JCGF.setFrameInterval = function(interval) {
        _interval = interval;
        if(_timeout) {
            clearTimeout(_timeout);
            _timeout = null;
        }
        if(_interval) {
            _timeout = setTimeout(frame, _interval);
        }
    }

    /**
     * Draw string at position
     *
     * @param c string
     * @param x number column number (0 is leftmost)
     * @param y number row number (0 is topmost)
     *
     * Use spaces to clean up cells
     * No line breaks are supported
     */
    JCGF.print = function(c, x, y) {
        x = Math.floor(x);
        y = Math.floor(y);
        if(c && c.length && x >= 0 && x < _cols && y >= 0 && y < _rows) {
            var length = Math.min(c.length, _cols - x);
            _context.fillStyle = _bgColor;
            _context.textBaseline = 'top';
            _context.fillRect(_cellWidth * x, _cellHeight * y, _cellWidth * length, _cellHeight);
            _context.fillStyle = _textColor;
            for(var n = 0; n < length; n ++) {
                _context.fillText(c[n], _cellWidth * (x + n), _cellHeight * y);
            }
        }
    }

    /**
     * Clean the canvas
     */
    JCGF.clear = function() {
        _context.fillStyle = _bgColor;
        _context.fillRect(0, 0, _canvas.width, _canvas.height);
    }

    return JCGF;

})();
