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
    this.object;
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
            self.update3DSpace();
            self.update2DScreen();
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
//        document.addEventListener("key") //TODO : add reset keyboard listener
    },
    initLight : function(){
        this.light = new THREE.SpotLight(0xffffff);
        this.light.position.set(0,10,0);
        this.scene.add(this.light);
    },
    initGrid : function(){
//        this.grid = new THREE.GridHelper(400,0.5);
        var floorTexture = new THREE.ImageUtils.loadTexture( 'assets/image/checkerboard.jpg' );
        floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set( 10, 10 );
        // DoubleSide: render texture on both sides of mesh
        var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
        var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
        this.grid = new THREE.Mesh(floorGeometry, floorMaterial);
        this.grid.scale.set(0.06,0.06,0.06);
        this.grid.rotation.x = Math.PI / 2;
        this.scene.add(this.grid);
    },
    initXLabsController : function(){
      this.xLabsController = new xLabs.webCamController();
    },
    addObject : function(object){
        if(object instanceof  THREE.Object3D){
            this.adjustCenter(object);
            this.grid.position.y -= ((object.minVector.y+object.maxVector.y)/2-object.minVector.y);
            this.object = object;
            this.scene.add(this.object);
        }
    },
    loadObject : function(obj_path, mtll_path){
        var self = this;
        this.loader.load(obj_path, mtll_path, function(object){
            self.addObject(object);
        });
    },
    update3DSpace : function(){
//        if(!this.xLabsController.isFaceDetected) return; // TODO : using a counter provide fault-tolerance
        var self = this;
        this.xLabsController.update(function(deltaX, deltaY, dolly){
            self.orbitControl.rotateLeft(deltaX);
            self.orbitControl.rotateUp(deltaY);
            var zoomScale = getZoomScale();
            if(dolly === 1)
                self.orbitControl.dollyOut(zoomScale);
            else if (dolly=== -1)
                self.orbitControl.dollyIn(zoomScale);
            self.orbitControl.update();
        });

        if(this.xLabsController.autoRotate == 1){
            this.object.rotation.y += 0.01;
        }
        else if(this.xLabsController.autoRotate == -1){
            this.object.rotation.y -= 0.01;
        }
    },
    adjustCenter : function(object){
        if(!(object instanceof THREE.Object3D)) return;
        var minX=0, minY=0, minZ=0, maxX=0, maxY=0, maxZ=0;
        object.traverse(function(child){
            if(child instanceof THREE.Mesh){
                child.geometry.computeBoundingBox();
                var box = child.geometry.boundingBox;
                minX = Math.min(minX, box.min.x);
                minY = Math.min(minY, box.min.y);
                minZ = Math.min(minZ, box.min.z);
                maxX = Math.max(maxX, box.max.x);
                maxY = Math.max(maxY, box.max.y);
                maxZ = Math.max(maxZ, box.max.z);
            }
        });
        object.maxVector = new THREE.Vector3(maxX, maxY, maxZ);
        object.minVector = new THREE.Vector3(minX, minY, minZ);
        object.centerVector = new THREE.Vector3((maxX+minX)/2, (maxY+minY)/2, (maxZ+minZ)/2);
//        object.position.set(object.centerVector.x, object.centerVector.y, object.centerVector.z);
//        object.applyMatrix(new THREE.Matrix4().makeTranslation(-1*(maxX+minX)/2, -1*(maxY+minY)/2, -1*(maxZ+minZ)/2));
//        object.updateMatrix(true);
//        object.updateMatrixWorld(true);
        object.traverse(function(child){
            if(child instanceof THREE.Mesh){
//                var offset = child.geometry.center();
                child.applyMatrix(new THREE.Matrix4().makeTranslation(-1*(maxX+minX)/2, -1*(maxY+minY)/2, -1*(maxZ+minZ)/2));
//                child.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-1*(maxX+minX)/2, -1*(maxY+minY)/2, -1*(maxZ+minZ)/2));
//                child.geometry.verticesNeedUpdate = true;
//                child.geometry.computeBoundingBox();
//                var offset = child.geometry.center();
//                child.applyMatrix(new THREE.Matrix4().makeTranslation(-offset.x, -offset.y, -offset.z));
            }
        });
    },
    update2DScreen : function(){
        document.getElementById("faceDetected").innerHTML = this.xLabsController.isFaceDetected ? "Face Detected" : "No Face";
        if (this.xLabsController.dolly==1)
            document.getElementById("zoom").innerHTML = "Zoom In";
        else if (this.xLabsController.dolly==-1)
            document.getElementById("zoom").innerHTML = "Zoom Out";
        else
            document.getElementById("zoom").innerHTML = "";
        document.getElementById("left").innerHTML = this.xLabsController.autoRotate == 1 ? "Auto Left" : "";
        document.getElementById("right").innerHTML = this.xLabsController.autoRotate == -1 ? "Auto Right" : "";
    }
}

function getZoomScale() {
    return Math.pow( 0.95, 0.1 );
}