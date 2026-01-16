import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

// MediaPipe Pose Landmarks Mapping
// 0: nose
// 11: left_shoulder, 12: right_shoulder
// 13: left_elbow, 14: right_elbow
// 15: left_wrist, 16: right_wrist
// 23: left_hip, 24: right_hip
// 25: left_knee, 26: right_knee
// 27: left_ankle, 28: right_ankle
// 32: right_foot_index, 31: left_foot_index

// Segment Definitions: [start, end, thickness]
const LIMBS = [
    // Arms
    { start: 11, end: 13, thickness: 0.08, name: 'UpperArmL' },
    { start: 13, end: 15, thickness: 0.06, name: 'ForeArmL' },
    { start: 12, end: 14, thickness: 0.08, name: 'UpperArmR' },
    { start: 14, end: 16, thickness: 0.06, name: 'ForeArmR' },
    // Legs
    { start: 23, end: 25, thickness: 0.10, name: 'ThighL' },
    { start: 25, end: 27, thickness: 0.08, name: 'ShinL' },
    { start: 24, end: 26, thickness: 0.10, name: 'ThighR' },
    { start: 26, end: 28, thickness: 0.08, name: 'ShinR' },
    // Shoulder bridge to neck/head (custom)
]

const JOINTS = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]

// Premium Materials
const armorMat = new THREE.MeshStandardMaterial({
    color: "#cbd5e1", // Slate 300
    roughness: 0.2,
    metalness: 0.8,
})

const jointMat = new THREE.MeshStandardMaterial({
    color: "#0ea5e9", // Sky 500
    roughness: 0.5,
    metalness: 0.5,
    emissive: "#0ea5e9",
    emissiveIntensity: 0.2
})

const coreMat = new THREE.MeshStandardMaterial({
    color: "#334155", // Slate 700
    roughness: 0.7,
    metalness: 0.1
})

function Limb({ start, end, thickness, landmarks }) {
    const p1 = landmarks[start]
    const p2 = landmarks[end]

    if (!p1 || !p2 || (p1.visibility < 0.5 && p2.visibility < 0.5)) return null

    // Convert to Three.js coordinates
    // MediaPipe: y is down (0 at top, 1 at bottom). Three.js: y is up.
    // Also center the coordinates (0.5 offset)
    const v1 = new THREE.Vector3(p1.x - 0.5, (1 - p1.y) - 0.5, -p1.z)
    const v2 = new THREE.Vector3(p2.x - 0.5, (1 - p2.y) - 0.5, -p2.z)

    const distance = v1.distanceTo(v2)
    const position = v1.clone().lerp(v2, 0.5)

    const quaternion = new THREE.Quaternion()
    const direction = new THREE.Vector3().subVectors(v2, v1).normalize()
    const up = new THREE.Vector3(0, 1, 0)
    quaternion.setFromUnitVectors(up, direction)

    return (
        <mesh position={position} quaternion={quaternion} material={armorMat}>
            <capsuleGeometry args={[thickness, distance - thickness, 8, 16]} />
        </mesh>
    )
}

function Joint({ idx, landmarks }) {
    const lm = landmarks[idx]
    if (!lm || lm.visibility < 0.5) return null

    return (
        <mesh
            position={[lm.x - 0.5, (1 - lm.y) - 0.5, -lm.z]}
            material={jointMat}
        >
            <sphereGeometry args={[0.05, 16, 16]} />
        </mesh>
    )
}

function Torso({ landmarks }) {
    // Calculte torso center and orientation derived from shoulders and hips
    const l_shoulder = landmarks[11]
    const r_shoulder = landmarks[12]
    const l_hip = landmarks[23]
    const r_hip = landmarks[24]

    if (!l_shoulder || !r_shoulder || !l_hip || !r_hip) return null

    // Mid-points
    const mid_shoulder = new THREE.Vector3(
        (l_shoulder.x + r_shoulder.x) / 2 - 0.5,
        ((1 - l_shoulder.y) + (1 - r_shoulder.y)) / 2 - 0.5,
        -(l_shoulder.z + r_shoulder.z) / 2
    )
    const mid_hip = new THREE.Vector3(
        (l_hip.x + r_hip.x) / 2 - 0.5,
        ((1 - l_hip.y) + (1 - r_hip.y)) / 2 - 0.5,
        -(l_hip.z + r_hip.z) / 2
    )

    const distance = mid_shoulder.distanceTo(mid_hip)
    const position = mid_shoulder.clone().lerp(mid_hip, 0.5)
    
    // Orientation
    const quaternion = new THREE.Quaternion()
    const direction = new THREE.Vector3().subVectors(mid_hip, mid_shoulder).normalize()
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)

    return (
        <mesh position={position} quaternion={quaternion} material={coreMat}>
            {/* Box-like chest armor */}
            <boxGeometry args={[0.25, distance, 0.15]} />
        </mesh>
    )
}

function Head({ landmarks }) {
    // Nose is 0, ears are 7,8. Let's use nose for position.
    const nose = landmarks[0]
    if (!nose) return null
    
    // Estimate head position slightly above nose? Or just use nose center. 
    // Usually nose is center of face.
    const position = [nose.x - 0.5, (1 - nose.y) - 0.5 + 0.05, -nose.z]

    return (
        <group position={position}>
            {/* Helmet/Head */}
            <mesh material={armorMat}>
                 <capsuleGeometry args={[0.09, 0.12, 8, 16]} />
            </mesh>
            {/* Visor */}
            <mesh position={[0, 0.02, 0.08]} material={jointMat}>
                <boxGeometry args={[0.12, 0.05, 0.02]} />
            </mesh>
        </group>
    )
}

export default function Skeleton3D({ landmarks }) {
    if (!landmarks || !Array.isArray(landmarks) || landmarks.length === 0) return null

    return (
        <group scale={[2, 2, 2]} position={[0, -1, 0]} rotation={[0, Math.PI, 0]}>
            {/* Limbs */}
            {LIMBS.map((limb, i) => (
                <Limb key={limb.name} {...limb} landmarks={landmarks} />
            ))}
            
            {/* Joints */}
            {JOINTS.map(idx => (
                <Joint key={`joint-${idx}`} idx={idx} landmarks={landmarks} />
            ))}

            {/* Special Body Parts */}
            <Torso landmarks={landmarks} />
            <Head landmarks={landmarks} />
            
        </group>
    )
}
