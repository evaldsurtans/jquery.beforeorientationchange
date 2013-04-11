/** 
    @description jQuery plugin that adds beforeorientationchange event
    Tested on iOS & Android (browser, currently not working on Chrome browser)
    
    Examples of usage:
    $(window).bind('beforeorientationchange', function(){
        ...
    });
    $(window).bind('orientationchange', function(){
        ...
    });
                
    @author Evalds Urtans http://www.asketic.com, 2013    
*/
(function($){
    
    var self = {};
    
    self._timeoutOrientationNotChanged = 0;    
    self._$window = $(window);    
    self._orientationLast = -1;
    
    /**
     * Check if device supports window.orientation = 180 (upside-down state) 
     *  
     * @function hasUpsideDownOrientation
     * @return bool
     */
    self.hasUpsideDownOrientation = function() {
        return !(navigator.userAgent.match(/iPhone/i)) && 
                !(navigator.userAgent.match(/iPod/i));
    };
    
    /**
     * Backup method if detected wrongly. Triggers orientationchange if beforeorientationchange has been triggered
     *  
     * @function onOrientationNotChanged
     */
    self.onOrientationNotChanged = function() {        
        self._$window.trigger('orientationchange');
    };
    
    /**
     * Normalizes vector 
     *  
     * @function getVectorNormalize
     * @param vector
     * @return vector
     */
    self.getVectorNormalize = function(vector) {
        var length = Math.sqrt(vector.x*vector.x + vector.y*vector.y + vector.z*vector.z);
        
        vector.x /= length;
        vector.y /= length;
        vector.z /= length;
        
        return vector;
    };
    
    /**
     * Initialize plugin, no need to call from code
     *  
     * @constructor
     * @function init
     */
    self.init = function() {
        if(typeof(window.orientation) == 'undefined')
        {
            return;
        }        
        self._orientationLast = window.orientation;
        
        self._$window.bind("devicemotion", function(event) {
            
            //Calculations using orientation detection algorithm:
            //http://www.freescale.com/files/sensors/doc/app_note/AN3461.pdf
                        
            var accelerometerWithoutGravity = self.getVectorNormalize(event.originalEvent.accelerationIncludingGravity);
            var orientationCalculation = -1; 
            
            if( Math.abs(accelerometerWithoutGravity.z) < 0.7 &&
                accelerometerWithoutGravity.x > 0.5 &&
                Math.abs(accelerometerWithoutGravity.y) < 0.4 )
            {
                orientationCalculation = -90;
            }
            else if( Math.abs(accelerometerWithoutGravity.z) < 0.7 &&
                accelerometerWithoutGravity.x < -0.5 &&
                Math.abs(accelerometerWithoutGravity.y) < 0.4 )
            {
                orientationCalculation = 90;
            }
            else if( Math.abs(accelerometerWithoutGravity.z) < 0.7 &&
                accelerometerWithoutGravity.y > 0.5 &&
                Math.abs(accelerometerWithoutGravity.x) < 0.4 )
            {
                orientationCalculation = 180; 
            }
            else if( Math.abs(accelerometerWithoutGravity.z) < 0.7 &&
                accelerometerWithoutGravity.y < -0.5 &&
                Math.abs(accelerometerWithoutGravity.x) < 0.4 )
            {
                orientationCalculation = 0; 
            }
            
            if( self._orientationLast != orientationCalculation && 
                orientationCalculation != -1 &&
                (orientationCalculation != 180 || (self.hasUpsideDownOrientation() && orientationCalculation == 180)) )
            {
                self._orientationLast = orientationCalculation;
                
                self._$window.trigger('beforeorientationchange');
                
                clearTimeout(self._timeoutOrientationNotChanged);
                self._timeoutOrientationNotChanged = setTimeout(self.onOrientationNotChanged, 1000);                
            }
            
        });
         
        self._$window.bind('orientationchange', function(event) {            
            clearTimeout(self._timeoutOrientationNotChanged);           
        });
    };
    
    $(document).ready(function(){
        self.init();       
    });
    
})(jQuery);
