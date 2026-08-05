/* geo3d-helpers.js

Helpers to convert Leaflet (lat/lng) into Three.js local coordinates (meters),
create extruded building meshes, snap panels to roof with raycast, and build
instanced panels for better performance.

Usage:
 - Include this file in your design-studio.html after Leaflet and THREE are loaded.
 - Call getOriginProjectedFromMarker(pinMarker) once when the user places the pin.
 - Use createExtrudedBuilding when importing/exporting GeoJSON lat/lng polygons.
 - Use buildInstancedPanels / setInstancedMatrix to place panels via instancing.
*/

(function(global) {
  if (!global.THREE || !global.L) {
    console.warn('geo3d-helpers: THREE or Leaflet (L) is not available');
  }

  // Get origin projected point from a Leaflet marker (L.Marker) or {lat,lng}
  function getOriginProjectedFromMarker(marker) {
    var latlng = marker.getLatLng ? marker.getLatLng() : L.latLng(marker.lat, marker.lng);
    return {
      lat: latlng.lat,
      lng: latlng.lng,
      projected: L.CRS.EPSG3857.project(latlng)
    };
  }

  // Convert lat/lng -> local THREE.Vector3 (meters) relative to originProjected
  // three.js convention here: X = east, Y = up, Z = north
  function latLngToLocalVec3(lat, lng, originProjected, scale) {
    scale = (typeof scale === 'number') ? scale : 1;
    var p = L.CRS.EPSG3857.project(L.latLng(lat, lng));
    var dx = (p.x - originProjected.x) * scale; // east (meters)
    var dy = (p.y - originProjected.y) * scale; // north (meters)
    // Return X=east, Z=north
    return new THREE.Vector3(dx, 0, dy);
  }

  // Create extruded building mesh from latlng polygon
  // latlngs: array of {lat,lng} or Leaflet LatLngs
  // heightMeters: extrusion height (meters)
  // material: THREE.Material
  // originProjected: from getOriginProjectedFromMarker
  // scale: scale factor for units (default 1 => three unit = 1 meter)
  function createExtrudedBuilding(latlngs, heightMeters, material, originProjected, scale) {
    scale = (typeof scale === 'number') ? scale : 1;
    var pts2 = latlngs.map(function(ll) {
      var v = latLngToLocalVec3(ll.lat, ll.lng, originProjected, scale);
      return new THREE.Vector2(v.x, v.z);
    });

    // Ensure polygon is closed and valid
    if (pts2.length < 3) {
      console.error('createExtrudedBuilding: polygon must have at least 3 points');
      return null;
    }

    var shape = new THREE.Shape(pts2);
    var extrudeSettings = { depth: heightMeters * scale, bevelEnabled: false };
    var geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // Rotate so the extrude depth becomes Y (up). ExtrudeGeometry extrudes along +Z.
    geom.rotateX(-Math.PI / 2);

    // Translate so base sits on Y=0 (ground). After rotateX, depth is along Y.
    geom.translate(0, extrudeSettings.depth / 2, 0);

    geom.computeVertexNormals();
    var mesh = new THREE.Mesh(geom, material || new THREE.MeshStandardMaterial({ color: 0xaaaaaa }));
    mesh.castShadow = mesh.receiveShadow = true;
    return mesh;
  }

  // Raycast snap a panel mesh to the building roof
  var _raycaster = new THREE.Raycaster();
  function snapPanelToRoof(panelMesh, buildingMesh, offset) {
    offset = (typeof offset === 'number') ? offset : 0.02; // meters
    var origin = panelMesh.position.clone();
    origin.y += 10; // cast down from above
    _raycaster.set(origin, new THREE.Vector3(0, -1, 0));
    var hits = _raycaster.intersectObject(buildingMesh, true);
    if (hits.length) {
      var hit = hits[0];
      // Compute world-space normal
      var normal = hit.face.normal.clone();
      normal.transformDirection(hit.object.matrixWorld).normalize();
      // Move panel to hit point + offset along normal (prevent z-fighting)
      panelMesh.position.copy(hit.point).add(normal.clone().multiplyScalar(offset));
      // Align panel's up vector (0,1,0) to face normal
      var up = new THREE.Vector3(0, 1, 0);
      var q = new THREE.Quaternion().setFromUnitVectors(up, normal);
      panelMesh.quaternion.copy(q);
      return true;
    }
    return false;
  }

  // Build instanced panels
  function buildInstancedPanels(panelGeometry, panelMaterial, count) {
    var inst = new THREE.InstancedMesh(panelGeometry, panelMaterial, count);
    inst.castShadow = inst.receiveShadow = true;
    inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    return inst;
  }

  // Set instanced matrix
  var _tmpMat = new THREE.Matrix4();
  function setInstancedMatrix(instancedMesh, index, pos, quat, scale) {
    scale = scale || new THREE.Vector3(1,1,1);
    _tmpMat.compose(pos, quat, scale);
    instancedMesh.setMatrixAt(index, _tmpMat);
    instancedMesh.instanceMatrix.needsUpdate = true;
  }

  // Expose API
  global.geo3dHelpers = {
    getOriginProjectedFromMarker: getOriginProjectedFromMarker,
    latLngToLocalVec3: latLngToLocalVec3,
    createExtrudedBuilding: createExtrudedBuilding,
    snapPanelToRoof: snapPanelToRoof,
    buildInstancedPanels: buildInstancedPanels,
    setInstancedMatrix: setInstancedMatrix
  };

})(window);

/* Integration snippet (example):

// After including this script and initializing map, three.js scene
var origin = geo3dHelpers.getOriginProjectedFromMarker(pinMarker);
// Import GeoJSON polygon (lat/lngs)
var buildingMesh = geo3dHelpers.createExtrudedBuilding(polygonLatLngs, 6 /*height meters*/, null, origin);
scene.add(buildingMesh);

// Build panel geometry (example 1.6m x 1m panel lying horizontally centered at origin)
var panelGeom = new THREE.BoxBufferGeometry(1.6, 0.02, 1.0);
var panelMat = new THREE.MeshStandardMaterial({ color: 0x1e88e5 });
var instPanels = geo3dHelpers.buildInstancedPanels(panelGeom, panelMat, 200);
scene.add(instPanels);

// For each candidate XY placement (in local coords):
// create temporary mesh, place at X,Z, Y high, snap with geo3dHelpers.snapPanelToRoof(temp, buildingMesh)
// if hit, use temp.position and temp.quaternion to call geo3dHelpers.setInstancedMatrix(instPanels, i, pos, quat, scaleVec)

*/