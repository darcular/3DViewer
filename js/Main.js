/**
 * @author Yikai Gong
 */

var viewer;

function main(){
    if(Detector.webgl){
        viewer = new xLabs.Viewer();
        viewer.init();
        viewer.start();
    }
    else{
        alert('Sorry, your browser does not support WebGL');
    }
}
