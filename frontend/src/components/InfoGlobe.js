import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import gsap from "gsap";

const sizes = {
  width: 800,
  height: 800,
};
if (window.innerWidth < 800) {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
}
const clock = new THREE.Clock();
const earthRadius = 3;
if (window.innerWidth < 800) {
  sizes.width = window.innerWidth;
  sizes.height = 412;
}
const cloudRadius = earthRadius * 1.08;
const fullRotation = (2 * Math.PI * earthRadius) / 3;
const rotationSpeed = 0.1;
var rotateGlobe = true;
const loader = new GLTFLoader();
const location = {
  lon: 45,
  lat: -76,
  oldy: 0,
};
var dragGlobe = false;
let earthMesh;
//camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height);
camera.position.set(10, 0, 0);
let zoomState = false;
let pointer;
let loop;
const scene = new THREE.Scene();

function latLongToVector3(lat, lon) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(earthRadius + 0.02) * Math.sin(phi) * Math.cos(theta);
  const y = (earthRadius + 0.02) * Math.cos(phi);
  const z = (earthRadius + 0.02) * Math.sin(phi) * Math.sin(theta);

  // Calculate the rotation angles
  const rotationX = Math.PI / 2 - phi;
  const rotationY = -theta;

  return {
    position: new THREE.Vector3(x, y, z),
    rotation: new THREE.Euler(rotationX, rotationY, 0),
  };
}

const group = new THREE.Group();
const cloudGroup = new THREE.Group();
let cloudMesh;

export default function InfoGlobe() {
  var hasMounted = useRef(false);
  // const [userLocation, setUserLocation] = useState(null);
  useEffect(() => {
    if (hasMounted.current) {
      // Component has already mounted, it's a remount
      return;
    }

    // if ("geolocation" in navigator) {
    //   navigator.geolocation.getCurrentPosition(
    //     (position) => {
    //       // Retrieve the latitude and longitude from the position object
    //       const { latitude, longitude } = position.coords;

    //       // Update the state with the user's location
    //       setUserLocation({ lat: latitude, lon: longitude });
    //     },
    //     (error) => {
    //       console.error("Error getting user location:", error.message);
    //     }
    //   );
    // }

    const earthGeometry = new THREE.SphereGeometry(earthRadius, 50, 50);
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load("/images/texture/earthMap.jpg"),
      bumpMap: new THREE.TextureLoader().load("/images/texture/earthBump.jpg"),
      displacementMap: new THREE.TextureLoader().load(
        "/images/texture/earthbump.jpg"
      ),
      displacementScale: 0.1,
      bumpScale: 0.1,
    });

    earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    // earthMesh.rotation.set(
    //   spericalCoordsToCartesianCoords(3, location.lon, location.lat)
    // );
    group.add(earthMesh);

    loader.load(
      "models/car/1971_skoda_110_super_sport_lp.glb",
      function (glb) {
        const { position, rotation } = latLongToVector3(45, -76);

        // Apply position and rotation to the model's scene
        glb.scene.scale.copy(new THREE.Vector3(0.02, 0.02, 0.02));
        glb.scene.position.copy(position);
        glb.scene.rotation.copy(rotation);
        group.add(glb.scene);
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );

    scene.add(group);

    // set ambientlight
    const ambientlight = new THREE.AmbientLight(0xffffff, 0.2);
    ambientlight.intensity = 1.5;
    scene.add(ambientlight);

    // create cloudGeometry
    const cloudGeometry = new THREE.SphereGeometry(cloudRadius, 32, 32);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load("/images/texture/earthCloud.png"),
      transparent: true,
      opacity: 0.8,
    });
    cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    cloudMesh.renderOrder = 1;
    cloudGroup.add(cloudMesh);
    scene.add(cloudGroup);

    scene.add(camera);
    camera.lookAt(scene.position);

    //renderer
    const canvas = document.getElementById("webgl");
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas,
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.render(scene, camera);

    //controls

    window.addEventListener("resize", () => {
      if (window.innerWidth < 800) {
        sizes.width = window.innerWidth;
        sizes.height = 412;
      }

      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      renderer.setSize(sizes.width, sizes.height);
    });

    canvas.addEventListener("mousemove", (e) => {
      if (dragGlobe && !zoomState) {
        gsap.to(group.rotation, {
          y: group.rotation.y + e.movementX / 6,
          duration: 2,
        });
        gsap.to(cloudGroup.rotation, {
          y: cloudGroup.rotation.y + e.movementX / 6,
          duration: 2,
        });
      }
    });

    canvas.addEventListener("mousedown", (e) => {
      rotateGlobe = false;
      dragGlobe = true;
    });

    window.addEventListener("mouseup", () => {
      rotateGlobe = true;
      dragGlobe = false;
    });

    loop = () => {
      const deltaTime = clock.getDelta();
      renderer.render(scene, camera);

      scene.updateMatrix();
      if (zoomState | dragGlobe) {
        window.requestAnimationFrame(loop);
        return;
      }

      if (group.rotation.y >= fullRotation) {
        group.rotation.y = group.rotation.y - fullRotation;
      } else if (group.rotation.y <= fullRotation) {
        group.rotation.y = group.rotation.y + fullRotation;
      }
      if (rotateGlobe) {
        group.rotation.y += rotationSpeed * deltaTime;
        cloudGroup.rotation.y -= (rotationSpeed / 3) * deltaTime;
      }
      window.requestAnimationFrame(loop);
    };
    loop();
    return () => {
      // Cleanup actions for three js
      renderer.renderLists.dispose();
    };
  }, []);

  async function loadPin() {
    loader.load(
      "models/pointer/map_pointer.glb",
      function (glb) {
        const { position, rotation } = latLongToVector3(45, -76);

        // Apply position and rotation to the model's scene
        glb.scene.scale.copy(new THREE.Vector3(0.02, 0.02, 0.02));
        glb.scene.position.copy(position);
        glb.scene.rotation.copy(rotation);
        pointer = glb.scene;
        group.add(pointer);
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );
  }

  function toggleZoomedIn() {
    const camPosition = zoomState
      ? { x: 10, y: 0, z: 0 }
      : { x: 5, y: 0, z: 0 };

    const groupRotation = zoomState
      ? {
          y: location.oldy,
          z: 0,
        }
      : {
          y: THREE.MathUtils.degToRad(location.lon),
          z: THREE.MathUtils.degToRad(location.lat),
        };
    if (!zoomState) {
      location.oldy = group.rotation.y;
    }

    // Create a GSAP timeline
    const tl = gsap.timeline();
    if (zoomState) {
      pointer.visible = false;

      // Add zoom-in/zoom-out animation to the timeline
      tl.to(camera.position, {
        x: camPosition.x,
        y: camPosition.y,
        z: camPosition.z,
        duration: 1, // Adjust the duration as needed
        ease: "power1.inOut", // Use an ease function if desired
      });
      // Add rotation animation to the timeline
      tl.to(
        group.rotation,
        {
          y: groupRotation.y,
          z: groupRotation.z,
          duration: 2, // Adjust the duration as needed
          ease: "power1.inOut", // Use an ease function if desired
        },
        "-=1"
      );
    } else {
      if (pointer) {
        pointer.visible = true;
      } else {
        loadPin();
      }

      // Add rotation animation to the timeline
      tl.to(group.rotation, {
        y: groupRotation.y,
        z: groupRotation.z,
        duration: 2, // Adjust the duration as needed
        ease: "power1.inOut", // Use an ease function if desired
      });

      // Add zoom-in/zoom-out animation to the timeline
      tl.to(
        camera.position,
        {
          x: camPosition.x,
          y: camPosition.y,
          z: camPosition.z,
          duration: 1, // Adjust the duration as needed
          ease: "power1.inOut", // Use an ease function if desired
        },
        "-=1" // Start the zoom animation 1 second before the end of the rotation animation
      );
    }

    // Toggle the visibility of cloudMesh based on zoomState
    cloudGroup.visible = zoomState;

    // Update the zoomState
    zoomState = !zoomState;

    window.requestAnimationFrame(loop);
  }

  return (
    <div className="relative flex flex-col items-center justify-center bg-[url('https://ramsaysdetailing.ca/images/texture/galaxy.png')] 2xl:mb-0 2xl:flex-row 2xl:gap-5">
      <div className="z-1 flex flex-col items-center gap-5 pb-10 pt-10 text-center md:mb-0">
        <h1 className="text-2xl md:text-4xl lg:text-6xl ">
          <b>World Wide Detailing</b>
        </h1>
        <p className="text-center text-xl">
          Ramasy's Detailing is world wide buisness, <br /> we are dedicated to
          providing jobs around the globe.
        </p>
        <button
          onClick={() => toggleZoomedIn()}
          className="rounded-full border px-10 py-2 text-lg hover:border-2 hover:font-bold"
        >
          Click Me
        </button>
      </div>
      <canvas id="webgl" />
    </div>
  );
}
