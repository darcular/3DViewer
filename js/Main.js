/**
 * @author Yikai Gong
 */
//var time= Date.now(),container,camera,scene,renderer,skyBox,controlBox,wall,trackMesh,
//    ground,moto,track,orbitControl,directionalLight,gui,stats,
//    ready = false,
//    width = window.innerWidth,
//    height=window.innerHeight;


function main(){
    if(Detector.webgl){
        var viewer = new xLabs.Viewer();
        viewer.init();
        viewer.start();
    }
    else{
        alert('Sorry, your browser does not support WebGL');
    }
}
