
  let recentFollow;
  let recent_subs = [];
  var newFollow = false;
  var newTopTip = false;
  let secondaryContents = ['TopDonator 5 $', 'Endrju105'];

  window.onload = function () {
    const THREE = window.THREE;
    const TWEEN = window.TWEEN;
    const OrbitControls = THREE.OrbitControls;
    const FlyControls = THREE.FlyControls;
    const MeshSurfaceSampler = THREE.MeshSurfaceSampler;

    let titles = [];
    let secondaryTitles = [];
    let titlesContents = ["W E L C O M E", "TOP DONATOR\n", "LAST FOLLOW\n"];

    //config
    var loader = new THREE.FontLoader();
    var typeface =
      "https://cdn.rawgit.com/marpi/worlds/master/assets/fonts/helvetiker_regular.typeface.json";
    var sampler;
    var sampler2;
    let shape = 0;
    const pointsGeometry = new THREE.BufferGeometry();
    var newVertices = [];
    const particleCount = 8000;
    const particleSize = 0.7;

    const defaultAnimationSpeed = 1,
      morphAnimationSpeed = 18;
    const normalSpeed = defaultAnimationSpeed / 100,
      fullSpeed = morphAnimationSpeed / 100;

    let animationVars = {
      speed: normalSpeed,
      color: "#FFFFFF",
      //rotation: -10,
    };

    // Renderer
    var renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    //
    // Ensure Full Screen on Resize
    function fullScreen() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", fullScreen, false);

    // Scene
    var scene = new THREE.Scene();

    // Camera and position
    var camera = new THREE.PerspectiveCamera(
      27,
      window.innerWidth / window.innerHeight,
      1
    );
    camera.position.z = 70;

    // Lighting
    var light = new THREE.AmbientLight(0xffffff, 5000);
    scene.add(light);

    // Orbit Controls
    var controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    // Particle Vars
    var particles = new THREE.BufferGeometry();
    particles.vertices = [new THREE.Vector3()];

    for (var p = 0; p < particleCount; p++) {
      var vertex = new THREE.Vector3();
      vertex.x = 0;
      vertex.y = 0;
      vertex.z = 0;

      particles.vertices.push(vertex);
    }
    var customUniforms = {
      time: { value: 1 },
    };
    // Texts
    loader.load(typeface, (font) => {
      titlesContents.forEach((x, idx) => {
        titles[idx] = {};
        titles[idx].particles = new THREE.BufferGeometry();
        titles[idx].particles.vertices = [];

        titles[idx].geometry = new THREE.TextBufferGeometry(x, {
          font: font,
          size: 5,
          height: 3,
          curveSegments: 12,
        });
        titles[idx].geometry.center();

        const tempPos = new THREE.Vector3();

        sampler = new MeshSurfaceSampler(
          new THREE.Mesh(titles[idx].geometry)
        ).build();

        for (let i = 0; i < 8000; i++) {
          sampler.sample(tempPos);
          newVertices.push(
            tempPos.x,
            idx > 0 ? tempPos.y - idx * 7 : tempPos.y,
            tempPos.z
          );
        }

        titles[idx].particles.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(newVertices, 3)
        );
        const count = titles[idx].particles.attributes.position.count;
        const randoms = new Float32Array(count);
        for (let i = 0; i < count; i++) {
          randoms[i] = Math.random();
        }
        titles[idx].particles.setAttribute(
          "aColor",
          new THREE.Float32BufferAttribute(randoms, 1)
        );
        var pMaterial = new THREE.RawShaderMaterial({
          uniforms: customUniforms,
          blending: THREE.AdditiveBlending,
          vertexShader: document.getElementById("vertex_shader").textContent,
          fragmentShader:
            document.getElementById("fragment_shader").textContent,
        });

        titles[idx].particles.sortParticles = true;

        for (var p = 0; p < particleCount; p++) {
          var vertex = new THREE.Vector3();
          vertex.x = 0;
          vertex.y = 0;
          vertex.z = 0;

          titles[idx].particles.vertices.push(vertex);
        }
        titles[idx].points = new THREE.Points(titles[idx].particles, pMaterial);
        titles[idx].points.name = "title" + idx;
      });
      scene.add(titles[0].points);
    });

    function createVertices(emptyArray, points) {
      let modifier = -1;
      emptyArray.vertices = [];
      for (var p = 0; p < particleCount; p++) {
        var vertex = new THREE.Vector3();
        if (particleCount % 6) modifier = 1;
        vertex.x = points[p] + 10 * Math.random() * modifier;
        vertex.y = points[p + 1] + 10 * Math.random() * modifier;
        vertex.z = points[p + 2] + 10 * Math.random() * modifier;

        emptyArray.vertices.push(vertex);
      }
    }

    // Animate
    var clock = new THREE.Clock();
    var timer = 0;
    var rotationFlag;
    function animate() {
      var elapsedTime = clock.getElapsedTime();
      if (titles[0] && titles[0].points) {
        titles[0].points.material.uniforms.time.value = elapsedTime / 3;
        titles[0].points.material.needsUpdate = true;
      }
      if (elapsedTime > timer) {
        timer += 8;

        if (shape == 3) shape = 0;
        if (titles[0]) {
          resampleTitle();
          if (secondaryTitles.length > 0) resampleSecondaryTitle();
          shape++;
        }
      }

      if (titles[0] && titles[0].points) {
        if (!rotationFlag) {
          titles[0].points.rotation.y += animationVars.speed / 6;
        } else {
          titles[0].points.rotation.y -= animationVars.speed / 6;
        }
        if (titles[0].points.rotation.y > 0.2) {
          rotationFlag = true;
        } else if (titles[0].points.rotation.y < -0.2) {
          rotationFlag = false;
        }

        titles[0].points.geometry.attributes.position.needsUpdate = true;

        titles[0].points.geometry.attributes.aColor.needsUpdate = true;
      }

      if (secondaryTitles.length > 0 && shape == 1) {
        secondaryTitles[0].points.rotation.y -= animationVars.speed * 1.5;
        secondaryTitles[0].points.geometry.attributes.position.needsUpdate = true;
      } else if (secondaryTitles.length > 0) {
        secondaryTitles[0].points.rotation.y = 0;
        secondaryTitles[0].points.geometry.attributes.position.needsUpdate = true;
      }

      particles.verticesNeedUpdate = true;
      pointsGeometry.verticesNeedUpdate = true;

      window.requestAnimationFrame(animate);
      renderer.render(scene, camera);
      controls.update();
    }

    animate();

    function morphTo(newParticles, title, color = "#FFFFFF") {
      TweenMax.to(animationVars, 0.1, {
        ease: Power4.easeIn,
        speed: fullSpeed,
        onComplete: slowDown,
      });

      TweenMax.to(animationVars, 2, {
        ease: Linear.easeNone,
        color: color,
      });
      if (title)
        TweenMax.to(
          titles[0].particles.attributes.position.array,
          2,
          newParticles.attributes.position.array
        );
      else
        TweenMax.to(
          secondaryTitles[0].particles.attributes.position.array,
          2,
          newParticles.attributes.position.array
        );
      TweenMax.to(animationVars, 2, {
        ease: Elastic.easeOut.config(0.1, 0.3),
        rotation: 0,
      });
    }
    function slowDown() {
      TweenMax.to(animationVars, 0.3, {
        ease: Power2.easeOut,
        speed: normalSpeed,
        delay: 0.2,
      });
    }

    updateLastFollowerGeometry(true);
    function updateLastFollowerGeometry(initial) {
      loader.load(typeface, (font) => {
        newVertices = [];
        const idx = newFollow ? 1 : 0;
        const sT = scene.getObjectByName("sTitle" + idx);
        if (sT) removeObject(sT);
        secondaryContents.forEach((x, idx) => {
          if (!initial && newFollow && x == 0) return;
          if (!initial && newTopTip && x == 1) return;
          secondaryTitles[idx] = {};
          secondaryTitles[idx].particles = new THREE.BufferGeometry();
          secondaryTitles[idx].particles.vertices = [];
          secondaryTitles[idx].geometry = new THREE.TextBufferGeometry(
            secondaryContents[idx],
            {
              font: font,
              size: 5,
              height: 3,
              curveSegments: 12,
            }
          );
          secondaryTitles[idx].geometry.center();

          const tempPos = new THREE.Vector3();

          sampler2 = new MeshSurfaceSampler(
            new THREE.Mesh(secondaryTitles[idx].geometry)
          ).build();

          for (let i = 0; i < 8000; i++) {
            sampler2.sample(tempPos);
            newVertices.push(tempPos.x, tempPos.y - 9, tempPos.z);
          }

          secondaryTitles[idx].particles.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(newVertices, 3)
          );

          var pMaterial = new THREE.PointsMaterial({
            size: (0.1).toExponential,
            morphTargets: true,
            color: 0xff0000,
          });

          secondaryTitles[idx].particles.sortParticles = true;

          for (var p = 0; p < particleCount; p++) {
            var vertex = new THREE.Vector3();
            vertex.x = 0;
            vertex.y = 0;
            vertex.z = 0;

            secondaryTitles[idx].particles.vertices.push(vertex);
          }
          secondaryTitles[idx].points = new THREE.Points(
            secondaryTitles[idx].particles,
            pMaterial
          );

          secondaryTitles[idx].points.name = "sTitle" + idx;
        });
        if (secondaryTitles[0]) {
          scene.add(secondaryTitles[0].points);
          resampleSecondaryTitle();
        }
      });

      function removeObject(obj) {
        obj.geometry.dispose();
        obj.material.dispose();
        scene.remove(obj);
      }
    }

    function resampleTitle() {
      const tempPos = new THREE.Vector3();
      let vert = {};
      newVertices = [];

      if (!shape) {
        sampler = new MeshSurfaceSampler(
          new THREE.Mesh(titles[0].geometry)
        ).build();
      } else if (shape == 1) {
        sampler = new MeshSurfaceSampler(
          new THREE.Mesh(titles[1].geometry)
        ).build();
      } else {
        sampler = new MeshSurfaceSampler(
          new THREE.Mesh(titles[2].geometry)
        ).build();
      }

      sampler.geometry.center();

      for (let i = 0; i < 8000; i++) {
        sampler.sample(tempPos);
        newVertices.push(tempPos.x, tempPos.y + 5, tempPos.z);
      }
      vert.vertices = newVertices;
      createVertices(particles, vert);
      particles.vertices = newVertices;
      particles.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(newVertices, 3)
      );
      newVertices = [];
      titles[0].points.material.color = new THREE.Color(getColor());
      morphTo(particles, true);
    }

    function resampleSecondaryTitle() {
      const tempPos = new THREE.Vector3();
      let vert = {};

      if (!shape) {
        var newMesh = new THREE.Mesh(
          new THREE.SphereBufferGeometry(7.5, 50, 50)
        );
        sampler2 = new MeshSurfaceSampler(newMesh).build();
      } else if (shape == 1) {
        var newMesh = new THREE.Mesh(secondaryTitles[0].geometry);
        sampler2 = new MeshSurfaceSampler(newMesh).build();
      } else {
        var newMesh = new THREE.Mesh(secondaryTitles[1].geometry);
        sampler2 = new MeshSurfaceSampler(newMesh).build();
      }
      sampler2.geometry.center();

      for (let i = 0; i < 8000; i++) {
        sampler2.sample(tempPos);
        newVertices.push(tempPos.x, tempPos.y - 8, tempPos.z);
      }
      vert.vertices = newVertices;
      createVertices(particles, vert);
      particles.vertices = newVertices;
      particles.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(newVertices, 3)
      );
      newVertices = [];
      secondaryTitles[0].points.material.color = new THREE.Color(getColor());

      morphTo(particles, false);
    }

    var colors = [
      "#f44336",
      "#e91e63",
      "#9c27b0",
      "#673ab7",
      "#3f51b5",
      "#2196f3",
      "#03a9f4",
      "#00bcd4",
      "#009688",
      "#4CAF50",
      "#8BC34A",
      "#CDDC39",
      "#FFEB3B",
      "#FFC107",
      "#FF9800",
      "#FF5722",
    ];
    function getColor() {
      return colors[Math.round(Math.random() * 16)];
    }
  };
