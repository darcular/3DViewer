/**
 * @author Yikai Gong
 */
var xLabs= xLabs || {};
xLabs.isXlabReady = false;
xLabs.isCamOn = false;

xLabs.webCamController = function(){
    var self = this;
    this.thresholdRatio = 0.9;  // threshold / haedZ
    this.oldHeadX = 0;
    this.oldHeadY = 0;
    this.oldHeadZ = 0;
    this.headX = 0;
    this.headX = 0;
    this.headX = 0;
    this.dolly = 0;
    this.roll = 0;
    this.autoRotate = 0;
    this.isFaceDetected = false;
    document.addEventListener( "xLabsApiReady", function(){self.onApiReady();});
    document.addEventListener( "xLabsApiState", function( event ){self.onApiState(event.detail);});
    $(window).bind("beforeunload", function() {
        self.close();
    })
}

xLabs.webCamController.prototype = {
    onApiState : function(state){
        if(!xLabs.isCamOn && state.kvRealtimeActive == 1){xLabs.isCamOn = true;}
        this.headX = state.kvHeadX;
        this.headY = state.kvHeadY;
        this.headZ = state.kvHeadZ;
        this.roll = state.kvHeadRoll;
        this.isFaceDetected = state.kvValidationErrors[0]=="F" ? false : true;
        document.getElementById("h1").innerHTML="X: " + this.headX;
        document.getElementById("h2").innerHTML="Y: " + this.headY;
        document.getElementById("h3").innerHTML="Z: " + this.headZ;
    },
    onApiReady : function(){
        xLabs.isXlabReady = true;
        window.postMessage({target:"xLabs", payload:{overlayEnabled:0}}, "*" );
        window.postMessage({target:"xLabs", payload:{overlayMode:0}}, "*");
        window.postMessage({target:"xLabs", payload:{realtimeEnabled:1}}, "*");
        window.postMessage({target:"xLabs", payload:{pinpointEnabled:0}}, "*" );
        window.postMessage({target:"xLabs", payload:{validationEnabled :1}}, "*" );
    },
    close : function(){
        if(xLabs.isCamOn){
            window.postMessage({target:"xLabs", payload:{realtimeEnabled:0}}, "*");
        }
    },
    update : function(callback){
        if(!this.headX || !this.headY || !this.headZ) return;  //to avoid undefined value
        // x movement
        var newValueX = smoother(this.oldHeadX, this.headX, 0.8);
        var deltaX;
        var viewOffSetX= newValueX;
//        if(newValueX > this.headZ * this.thresholdRatio){
//            this.autoRotate = 1; //left
//            deltaX = 0;
//            viewOffSetX = this.headZ * this.thresholdRatio;
//        }
//        else if(newValueX < -this.headZ * this.thresholdRatio){
//            this.autoRotate = -1; //right
//            deltaX = 0;
//            viewOffSetX = -this.headZ * this.thresholdRatio;
//        }
//        else{
//            this.autoRotate = 0;
//            deltaX = (newValueX - this.oldHeadX)/8.0;
//        }
//        console.log(this.roll);
        if(this.roll > 0.25){
           this.autoRotate =1;
        }
        else if(this.roll < -0.25){
            this.autoRotate =-1;
        }
        else{
            this.autoRotate = 0;
        }
        deltaX = newValueX - this.oldHeadX;




        // y movement
        var newValueY = smoother(this.oldHeadY, this.headY, 0.8);
        var deltaY = 0;
//        deltaY = (newValueY - this.oldHeadY)/5;   //up and down has been removed
//        console.log(deltaY);


        // z movement
        this.dolly = 0;
        if(this.headZ<1.6){
            this.dolly = 1;
        }
        else if(this.headZ>2.4){
            this.dolly = -1;
        }

//        this.oldHeadX = newValueX === undefined ? 0 : newValueX;
//        this.oldHeadY = newValueY === undefined ? 0 : newValueY;
//        this.oldHeadZ = this.headZ;


        callback(deltaX, -deltaY, this.dolly, viewOffSetX);
    }
}

function smoother(currentValue, targetValue, alpha ){
    var output;
    var beta = 1.0 - alpha;
    output = targetValue * beta + currentValue * alpha === undefined ? 0 : targetValue * beta + currentValue * alpha;
    return output;
}


//xLabs.webCamController = {
//    headX : 0,
//    headY : 0,
//    headZ : 0,
//    onApiState : function(state){
//        if(!xLabs.isCamOn && state.kvRealtimeActive == 1){xLabs.isCamOn = true;}
//        this.headX = state.kvHeadX;
//        this.headY = state.kvHeadY;
//        this.headZ = state.kvHeadZ;
//
//        document.getElementById("h1").innerHTML="X: " + this.headX;
//        document.getElementById("h2").innerHTML="Y: " + this.headY;
//        document.getElementById("h3").innerHTML="Z: " + this.headZ;
//    },
//    onApiReady : function(){
//        xLabs.isXlabReady = true;
//        window.postMessage({target:"xLabs", payload:{overlayEnabled:0}}, "*" );
//        window.postMessage({target:"xLabs", payload:{overlayMode:0}}, "*");
//        window.postMessage({target:"xLabs", payload:{realtimeEnabled:1}}, "*");
//        window.postMessage({target:"xLabs", payload:{pinpointEnabled:0}}, "*" );
//    },
//    close : function(){
//        if(xLabs.isCamOn){
//            window.postMessage({target:"xLabs", payload:{realtimeEnabled:0}}, "*");
//        }
//    }
//}
//document.addEventListener( "xLabsApiReady", function(){xLabs.webCamController.onApiReady();});
//document.addEventListener( "xLabsApiState", function( event ){xLabs.webCamController.onApiState(event.detail);});
//$(window).bind("beforeunload", function() {
//    xLabs.webCamController.close();
//})
