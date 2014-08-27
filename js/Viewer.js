/**
 * @author Yikai Gong
 */
var xLabs = xLabs || {};

xLabs.Viewer = function(){
    this.container = null;
    this.camera = null;
    this.scene = null;
    this.renderer = null;
    this.grid = null;
    this.orbitControl = null;
    this.light = null;
    this.xLabsController = null;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.loader = new THREE.OBJMTLLoader();
};

xLabs.Viewer.prototype = {
    init : function(){
        this.container=document.getElementById('container');
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setSize(this.width,this.height);
        this.container.appendChild(this.renderer.domElement);
        this.scene = new THREE.Scene();
        THREEx.WindowResize(this.renderer, this.camera);
        this.initCamera();
        this.initLight();
        this.initGrid();
        this.loadObject('assets/models/motocycle/moto01.obj','assets/models/motocycle/moto01.mtl');
        this.initXLabsController();
    },
    start : function(){
        var self = this;
        function animate(){
            requestAnimationFrame(animate);
            self.update();
            self.renderer.render(self.scene,self.camera);
        }
        animate();
    },
    initCamera : function(){
        this.camera = new THREE.PerspectiveCamera(50, this.width/this.height, 0.1, 30000);
        this.camera.position.set(2,2,2);
        this.camera.lookAt(new THREE.Vector3(0,0,0));
        this.orbitControl = new THREE.OrbitControls( this.camera, this.renderer.domElement );
        this.orbitControl.userPan = false;
        this.orbitControl.userPanSpeed = 0.0;
        this.orbitControl.minDistance = 1;
        this.orbitControl.maxDistance = 4;
        this.orbitControl.target = new THREE.Vector3(0,0,0);
    },
    initLight : function(){
        this.light = new THREE.SpotLight(0xffffff);
        this.light.position.set(0,10,0);
        this.scene.add(this.light);
    },
    initGrid : function(){
        this.grid = new THREE.GridHelper(400,0.5);
        this.scene.add(this.grid);
    },
    initXLabsController : function(){
      this.xLabsController = new xLabs.webCamController();
    },
    addObject : function(object){
        if(object instanceof  THREE.Object3D)
            this.scene.add(object);
    },
    loadObject : function(obj_path, mtll_path){
        var self = this;
        this.loader.load(obj_path, mtll_path, function(object){
           self.addObject(object);
        });
    },
    update : function(){
        var self = this;
        this.xLabsController.update(function(deltaX, deltaY, dolly){
//            console.log(obj.headX - obj.oldHeadX);
            self.orbitControl.rotateLeft(deltaX);
            self.orbitControl.rotateUp(deltaY);
            var zoomScale = getZoomScale();
            if(dolly === 1)
                self.orbitControl.dollyOut(zoomScale);
            else if (dolly=== -1)
                self.orbitControl.dollyIn(zoomScale);
            self.orbitControl.update();
        });
//        this.orbitControl.rotateLeft(0.1);
//        this.orbitControl.update();
    }
}

function getZoomScale() {
    return Math.pow( 0.95, 0.1 );
}