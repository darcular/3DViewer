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
    this.object = new THREE.Object3D();
    this.gui;
    this.importObj;
    this.loader;
};

xLabs.Viewer.prototype = {
    init : function(){
        var self = this;
        this.container=document.getElementById('container');
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setSize(this.width,this.height);
        this.container.appendChild(this.renderer.domElement);
        this.scene = new THREE.Scene();
        this.scene.add(this.object);
        THREEx.WindowResize(this.renderer, this.camera);
        this.initGUI();
        this.initCamera();
        this.initLight();
        this.initGrid();
        this.loadObject('assets/models/motocycle/moto01.obj','assets/models/motocycle/moto01.mtl');
        this.initXLabsController();
//        this.gl = this.renderer.domElement.getContext("webgl");
        this.loader = new Loader(this);
        window.addEventListener("resize", function () {
            self.width = window.innerWidth;
            self.height = window.innerHeight;
        });
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
        this.camera.position.set(2,1,0);
        this.camera.lookAt(new THREE.Vector3(0,0,0));

        this.camera.setViewOffset(this.width,this.height, this.width/4 , this.height/4, this.width/2, this.height/2);

        this.orbitControl = new THREE.OrbitControls( this.camera, this.renderer.domElement );
        this.orbitControl.userPan = false;
        this.orbitControl.userPanSpeed = 0.0;
        this.orbitControl.minDistance = 0.1;
        this.orbitControl.maxDistance = Infinity;
        this.orbitControl.target = new THREE.Vector3(0,0,0);
//        document.addEventListener("key") //TODO : add reset keyboard listener
    },
    initLight : function(){
        this.light = new THREE.SpotLight(0xffffff);
        this.light.position.set(0,10000,0);
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
        this.grid.scale.set(0.02,0.02,0.02);
        this.grid.rotation.x = Math.PI / 2;
        this.scene.add(this.grid);
    },
    initXLabsController : function(){
      this.xLabsController = new xLabs.webCamController();
    },
    addObject : function(object){
        this.clearObject();
        if(object instanceof  THREE.Object3D){
            this.adjustModel(object);
            this.grid.position.y = 0 - object.newScale*object.heightY/2;
//            this.object = object;
//            this.scene.add(this.object);
            this.object.add(object);
        }
    },
    clearObject : function(){
//        this.scene.remove(this.object);
        this.object.traverse(function(child){
            viewer.object.remove(child);
        });
//        this.object.remove
    },
    setScene : function(scene){
        this.scene = scene;
    },
    loadObject : function(obj_path, mtll_path){
        var self = this;
        this.loader.load(obj_path, mtll_path, function(object){
            self.addObject(object);
        });
    },
    update3DSpace : function(){
//        if(!this.xLabsController.isFaceDetected) return; // TODO : using a counter to provide fault-tolerance
        var self = this;
        this.xLabsController.update(function(deltaX, deltaY, dolly, viewOffSetX){
            self.orbitControl.rotateUp(deltaY);
            self.orbitControl.panLeft(2*deltaX/8);
//            console.log(self.camera.position);
            var distance = new THREE.Vector3().copy(self.orbitControl.object.position).sub(self.orbitControl.target).length();
//            console.log(distance);
            var zoomScale = getZoomScale();
            if(dolly === 1)
                self.orbitControl.dollyOut(zoomScale);
            else if (dolly=== -1 && distance < 10)
                self.orbitControl.dollyIn(zoomScale);
//            console.log(self.width);
            self.orbitControl.update();

            var windowPosition = self.width/3 + 150 * viewOffSetX/distance;
            if(windowPosition > 2*self.width/3) windowPosition = 2*self.width/3;
            else if(windowPosition < 0) windowPosition = 0;
            self.camera.setViewOffset(self.width,self.height, windowPosition, self.height/3, self.width/3, self.height/3);  //350
//            console.log(self.width*2/3 +", "+ (self.width/3 + 350 * viewOffSetX/distance));
            self.xLabsController.oldHeadX += deltaX === undefined ? 0 : deltaX;
        });
        if(this.xLabsController.autoRotate == 1){
            this.object.rotation.y += 0.01;
        }
        else if(this.xLabsController.autoRotate == -1){
            this.object.rotation.y -= 0.01;
        }
//        this.object.applyMatrix(new THREE.Matrix4().makeRotationY(0.05));
//        this.object.rotation.y += 0.005;

//        this.object.applyMatrix(new THREE.Matrix4().makeScale(this.object.newScale, this.object.newScale, this.object.newScale));
//        this.object.applyMatrix(new THREE.Matrix4().makeTranslation(-1*(this.object.maxX+this.object.minX)*this.object.newScale/2, -1*(this.object.maxY+this.object.minY)*this.object.newScale/2, -1*(this.object.maxZ+this.object.minZ)*this.object.newScale/2));
//        this.object.applyMatrix(new THREE.Matrix4().makeTranslation(0.0001, 0.0001, 0.0001));
    },

    adjustModel : function(object){
        if(!(object instanceof THREE.Object3D)) return;
        //calculate model center and new scale
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
        object.widthX = maxX-minX;
        object.heightY = maxY-minY;
        object.lengthZ = maxZ-minZ;


        object.newScale = 1/Math.max(object.widthX, Math.max(object.heightY, object.lengthZ));
//        object.maxVector = new THREE.Vector3(maxX, maxY, maxZ);
//        object.minVector = new THREE.Vector3(minX, minY, minZ);
//        object.centerVector = new THREE.Vector3((maxX+minX)/2, (maxY+minY)/2, (maxZ+minZ)/2);

        //applyMatrix at object3D level does not change the rotation center, apply matrix at mesh level instead
//        object.applyMatrix(new THREE.Matrix4().makeTranslation(-1*(maxX+minX)/2, -1*(maxY+minY)/2, -1*(maxZ+minZ)/2));

        //set the new scale and new center of model
        object.traverse(function(child){
            if(child instanceof THREE.Mesh){
                //solution 1
//                child.applyMatrix(new THREE.Matrix4().makeScale(object.newScale, object.newScale, object.newScale));
//                child.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-(maxX+minX)/4, -(maxY+minY)/4, -(maxZ+minZ)/4));
//                child.applyMatrix(new THREE.Matrix4().makeTranslation((maxX+minX)*object.newScale/4, (maxY+minY)*object.newScale/4, (maxZ+minZ)*object.newScale/4));

                //solution2
                child.applyMatrix(new THREE.Matrix4().makeScale(object.newScale, object.newScale, object.newScale));
                child.applyMatrix(new THREE.Matrix4().makeTranslation(-(maxX+minX)*object.newScale/2, -(maxY+minY)*object.newScale/2, -(maxZ+minZ)*object.newScale/2));


//                child.geometry.computeBoundingBox();
//                child.geometry.center();
//                child.applyMatrix(new THREE.Matrix4().makeTranslation(-1*(maxX+minX)*object.newScale/2, -1*(maxY+minY)*object.newScale/2, -1*(maxZ+minZ)*object.newScale)/2);

//                    offset = child.geometry.center();
//                child.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-offset.x, -offset.y, -offset.z))
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
    },
    initGUI : function (){
        var self = this;
        this.gui = new dat.GUI();
        this.importObj = document.createElement("input");
        this.importObj.type = 'file';
        this.importObj.addEventListener("change", onFileChange);
        var parameters =
        {
            a: function() {self.importObj.click();},
            b: function() {self.clearObject();}
        };
        // gui.add( parameters )
        this.gui.add( parameters, 'a' ).name('Import');
        this.gui.add( parameters, 'b' ).name('Clear');
//    this.gui.open();
        this.gui.close();
    }
}

function getZoomScale() {
    return Math.pow( 0.95, 0.1 );
}

function onFileChange(event){
    viewer.loader.loadFile(viewer.importObj.files[0]);
}