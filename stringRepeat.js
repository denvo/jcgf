/**
 * String.prototype.repeat replacement for unsupported browsers
 * From http://stackoverflow.com/questions/202605/repeat-string-javascript#answer-5450113
 *
 * Copyright (C) http://stackoverflow.com/users/489553/disfated
*/

if(!String.prototype.repeat) {
    String.prototype.repeat = function(count) {
        if (count < 1) return '';
        var result = '', pattern = this.valueOf();
        while (count > 1) {
            if (count & 1) result += pattern;
            count >>= 1, pattern += pattern;
        }
        return result + pattern;
    };
}
