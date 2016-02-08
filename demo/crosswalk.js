/**
 * JavaScript Console Game Framework
 * by Denis Volkov (C) 2016
 *
 * Crosswalk game demo
 *
 * See LICENSE for license information
 */

'use strict';

(function(jcgf) {
    // Screen size
    var screenWidth = 64;
    var screenHeight = 25;

    // Road position
    var firstLineRow = 16;
    var crosswalkPos = 49;

    // Road elements
    var sprites = {
        man: 'W',
        deadMan: '+',
        crosswalk: '=',
        lane: '-',
        trace: '.',
        car: '>'
    }

    // Font size
    var fontSize = 24;

    // Number of lanes
    var lanesCount = 8;

    // Some car-related constants
    var minSpeed = 5,
        speedStep = 1,
        minDistance = 16,
        distanceStep = 3;

    // Current position of the man (-1 - initial position, lanesCount - final position)
    var manPos = 0;

    // Leftmost position of the car in each row
    var carPositions = [];

    // Move count
    var moves = 0;

    // Game end flag
    var gameEnd = true;

    // Init the game
    function initGame() {
        console.log('initGame');
        // Set up man and cars
        manPos = -1;
        carPositions = [];
        for(var n = 0; n < lanesCount; ++ n) {
            carPositions[n] = Math.floor(Math.random() * (minDistance + distanceStep * n));
        }
        moves = 0;

        // Draw the field
        jcgf.clear();
        jcgf.print('* CROSSWALK GAME *', 23, 1);
        jcgf.print('MOVES: 0', 5, 3);
        jcgf.print('Use UP and DOWN keys to move, SPACE to stay', 10, 22);

        drawRoad();

        gameEnd = false;
    }

    function gameWon() {
        console.log('gameWon');
        showBanner(['Y O U   W O N !', '', 'Press SPACE to play again']);
        gameEnd = true;
    }

    function gameLost() {
        console.log('gameLost');
        showBanner(['Y O U   L O S T !', '', 'Press SPACE to play again']);
        gameEnd = true;
    }

    // Make game step
    function gameStep() {
        console.log('gameStep', manPos);
        // Move cars
        var speed, distance;
        for(var lane = 0; lane < lanesCount; ++ lane) {
            speed = minSpeed + speedStep * lane;
            distance = minDistance + distanceStep * lane;
            carPositions[lane] = (carPositions[lane] + speed) % distance;
        }

        // Check if man has survived
        var traceLength = -1;
        if(manPos < lanesCount && manPos != -1) {
            speed = minSpeed + speedStep * manPos;
            distance = minDistance + distanceStep * manPos;
            traceLength = (carPositions[manPos] - crosswalkPos + distance * 1000) % distance;
            console.log('traceLength', traceLength, speed);
            if(traceLength > speed) {
                traceLength = -1;
            }
        }

        // Count moves
        ++ moves;
        jcgf.print(moves + '  ', 12, 3);

        drawRoad(traceLength);

        // Check game end conditions
        if(traceLength != -1) {
            gameLost();
        } else if(manPos == lanesCount) {
            gameWon();
        }
    }

    // Show banner on the screen
    function showBanner(strings) {
        // Calculate dimensions and position
        var bannerWidth = 0;
        strings.forEach(function(s) {
            bannerWidth = Math.max(bannerWidth, s.length);
        });
        bannerWidth += 4;
        var bannerHeight = strings.length + 2;
        var bannerLeft = Math.floor((screenWidth - bannerWidth - 4) / 2);
        var bannerTop = Math.floor((screenHeight - bannerHeight - 4) / 2 + 2);

        // Draw top part
        var y = bannerTop;
        jcgf.print(' '.repeat(bannerWidth + 4), bannerLeft, y ++);
        jcgf.print(' ' + '#'.repeat(bannerWidth + 2) + ' ', bannerLeft, y ++);
        jcgf.print(' #' + ' '.repeat(bannerWidth) + '# ', bannerLeft, y ++);

        // Draw contents
        var str;
        strings.forEach(function(s) {
            str = ' '.repeat(Math.floor((bannerWidth - s.length) / 2)) + s;
            str += ' '.repeat(bannerWidth - str.length);
            jcgf.print(' #' + str + '# ', bannerLeft, y ++);
        });

        // Draw bottom part
        jcgf.print(' #' + ' '.repeat(bannerWidth) + '# ', bannerLeft, y ++);
        jcgf.print(' ' + '#'.repeat(bannerWidth + 2) + ' ', bannerLeft, y ++);
        jcgf.print(' '.repeat(bannerWidth + 4), bannerLeft, y ++);
    }

    // Draw the road
    function drawRoad(traceLength) {
        console.log('drawRoad', manPos, carPositions.join(', '));
        for(var lane = 0; lane < lanesCount; ++ lane) {
            var carPos = carPositions[lane];
            var distance = minDistance + distanceStep * lane;
            var laneStr = carPos ? sprites.lane.repeat(carPos) : '';
            while(carPos < screenWidth + distance) {
                laneStr += sprites.car + sprites.lane.repeat(distance - 1);
                carPos += distance;
            }
            if(lane == manPos || laneStr[crosswalkPos] === sprites.lane) {
                laneStr = laneStr.substr(0, crosswalkPos) +
                    (lane == manPos ? (traceLength != -1 ? sprites.deadMan : sprites.man) : sprites.crosswalk) +
                    laneStr.substr(crosswalkPos + 1);
                if(lane == manPos && traceLength > 1) {
                    laneStr = laneStr.substr(0, crosswalkPos + 1) +
                        sprites.trace.repeat(traceLength - 1) +
                        laneStr.substr(crosswalkPos + traceLength);
                }
            }
/*
            laneStr = laneStr.substr(0, crosswalkPos);
            laneStr += lane == manPos ? (gameLost ? sprites.deadMan : sprites.man) : sprites.crosswalk;
            if(carPos > laneStr.length) {
                laneStr += ((lane == manPos && gameLost) ? sprites.trace : sprites.lane).repeat(carPos - laneStr.length);
            }
            while(carPos < screenWidth + distance) {
                laneStr += sprites.car + sprites.lane.repeat(distance - 1);
                carPos += distance;
            }
*/            laneStr = laneStr.substr(0, screenWidth);
            jcgf.print(laneStr, 0, firstLineRow - lane);
        }
        jcgf.print(manPos == -1 ? sprites.man : sprites.crosswalk, crosswalkPos, firstLineRow + 1);
        jcgf.print(manPos == lanesCount ? sprites.man : sprites.crosswalk, crosswalkPos, firstLineRow - lanesCount);
    }

    // Register frame callback and initialize the framework
    jcgf(function(_jcgf, keys) {
        if(gameEnd) {
            if(keys === 0x20) {
                initGame();
            }
        } else {
            var newPos = null;
            // Check key code (https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key#Key_values)
            if(keys == 0x26) {
                // Move up
                newPos = manPos + 1;
            } else if(keys == 0x28) {
                if(manPos > -1) {
                    newPos = manPos - 1;
                }
            } else if(keys === 0x20) {
                newPos = manPos;
            }

            if(newPos !== null) {
                manPos = newPos;
                gameStep();
            }
        }
    });

    // Set canvas size
    jcgf.setSize(screenWidth, screenHeight, fontSize);

    // Show welcome banner
    showBanner(['C R O S S W A L K   G A M E', '',
        'You need to reach the opposite side of highway',
        'Use UP and DOWN keys to move, SPACE to stay', '',
        'Press SPACE to start']);

})(window.JCGF);
