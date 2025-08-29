import React, { useEffect, useRef } from 'react';
import { Field, FieldType, PanelProps } from '@grafana/data';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import URDFLoader from 'urdf-loader';
import type { PanelOptions } from '../types';

// Influx field -> URDF joint name
const FIELD_MAP: Record<string, string> = {
  base:     'shoulder_pan_joint',
  shoulder: 'shoulder_lift_joint',
  elbow:    'elbow_joint',
  wrist1:   'wrist_1_joint',
  wrist2:   'wrist_2_joint',
  wrist3:   'wrist_3_joint',
};

const SIGN_MAP: Record<string, number> = {
  shoulder_pan_joint:  1,
  shoulder_lift_joint: 1,
  elbow_joint:         1,
  wrist_1_joint:       1,
  wrist_2_joint:       1,
  wrist_3_joint:       1,
};

const UNIT_SCALE = 1;

const JOINTS = [
  'shoulder_pan_joint',
  'shoulder_lift_joint',
  'elbow_joint',
  'wrist_1_joint',
  'wrist_2_joint',
  'wrist_3_joint',
] as const;

type JointMap = Record<string, number>;

function latestOfField(field: Field | undefined): number | undefined {
  if (!field || field.type !== FieldType.number || !field.values?.length) return undefined;
  const v = Number(field.values.get(field.values.length - 1));
  return Number.isFinite(v) ? v : undefined;
}

function extractLatestJoints(props: PanelProps<PanelOptions>): JointMap | null {
  const frame = props.data.series?.[0];
  if (!frame) return null;
  const out: JointMap = {};
  for (const f of frame.fields) {
    const src = f.name;
    const dst = FIELD_MAP[src];
    if (!dst) continue;
    const v = latestOfField(f);
    if (typeof v !== 'number') continue;
    out[dst] = (v * UNIT_SCALE) * (SIGN_MAP[dst] ?? 1);
  }
  return Object.keys(out).length ? out : null;
}

function disposeObject(obj: THREE.Object3D) {
  obj.traverse((o: any) => {
    if (o.geometry) o.geometry.dispose?.();
    const m = o.material;
    if (Array.isArray(m)) m.forEach((mm) => mm?.dispose?.());
    else m?.dispose?.();
  });
}

export const UrdfPanel: React.FC<PanelProps<PanelOptions>> = (props) => {
  const { width, height, options } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef  = useRef<THREE.WebGLRenderer>();
  const cameraRef    = useRef<THREE.PerspectiveCamera>();
  const controlsRef  = useRef<OrbitControls>();
  const sceneRef     = useRef<THREE.Scene>();
  const robotRef     = useRef<any>(null);
  const animRef      = useRef<number>(0);

  const targetRef    = useRef<JointMap>(Object.fromEntries(JOINTS.map(j => [j, 0])) as JointMap);

  // Keep in sync with plugin.json "id"
  const pluginId = 'ijaz-ur16e-panel';
  const model = options?.model ?? 'ur16e'; // 'ur16e' | 'ur10e'
  const urdfUrl  = `/public/plugins/${pluginId}/img/ur_description/urdf/${model}.urdf`;

  useEffect(() => {
    const el = containerRef.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    el.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 100);
    camera.position.set(1.2, 1.0, 1.6);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.4, 0);
    controlsRef.current = controls;

    scene.add(new THREE.GridHelper(1.5, 12));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7.5);
    scene.add(dirLight);
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    const tick = () => {
      animRef.current = requestAnimationFrame(tick);
      const robot = robotRef.current;
      if (robot) {
        for (const name of JOINTS) {
          const j = robot.joints[name];
          if (j) j.setJointValue(targetRef.current[name] ?? 0);
        }
      }
      controls.update();
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(animRef.current);
      controls.dispose();
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap URDF when model changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (robotRef.current) {
      scene.remove(robotRef.current);
      disposeObject(robotRef.current);
      robotRef.current = null;
    }

    const loader = new URDFLoader();
    loader.load(
      urdfUrl,
      (robot) => {
        robot.rotation.x = -Math.PI / 2;
        scene.add(robot);
        robotRef.current = robot;
      },
      undefined,
      (err) => console.error('URDF load error:', err)
    );
  }, [urdfUrl]);

  // Resize with panel
  useEffect(() => {
    const r = rendererRef.current, c = cameraRef.current;
    if (!r || !c) return;
    c.aspect = width / height;
    c.updateProjectionMatrix();
    r.setSize(width, height);
  }, [width, height]);

  // Apply latest data
  useEffect(() => {
    const joints = extractLatestJoints(props);
    if (!joints) return;
    for (const name of JOINTS) {
      const v = joints[name];
      if (typeof v === 'number' && Number.isFinite(v)) {
        targetRef.current[name] = v;
      }
    }
  }, [props.data]);

  return <div ref={containerRef} style={{ width, height }} />;
};
