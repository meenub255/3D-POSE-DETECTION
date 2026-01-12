import React, { useMemo } from 'react'
import * as THREE from 'three'

const CONNECTIONS = [
    [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
    [11, 23], [12, 24], [23, 24],
    [23, 25], [25, 27], [24, 26], [26, 28],
    [27, 31], [28, 32], [27, 29], [28, 30]
]

// Reusable geometry and material
const sphereGeo = new THREE.SphereGeometry(0.02, 16, 16)
const cylinderGeo = new THREE.CylinderGeometry(0.005, 0.005, 1, 8)
const activeMat = new THREE.MeshStandardMaterial({ color: "#4f46e5" })
const inactiveMat = new THREE.MeshStandardMaterial({ color: "#e11d48" })
const boneMat = new THREE.MeshStandardMaterial({ color: "#6366f1", opacity: 0.6, transparent: true })

export default function Skeleton3D({ landmarks }) {
    if (!landmarks || !Array.isArray(landmarks) || landmarks.length === 0) return null

    return (
        <group scale={[2, 2, 2]} position={[0, -1, 0]} rotation={[0, Math.PI, 0]}>
            {/* Render Joints */}
            {landmarks.map((lm, i) => {
                if (!lm) return null
                return (
                    <mesh
                        key={`joint-${i}`}
                        position={[lm.x - 0.5, (1 - lm.y) - 0.5, -lm.z]}
                        geometry={sphereGeo}
                        material={lm.visibility > 0.5 ? activeMat : inactiveMat}
                    />
                )
            })}

            {/* Render Bones */}
            {CONNECTIONS.map(([start, end], i) => {
                const p1 = landmarks[start]
                const p2 = landmarks[end]

                if (!p1 || !p2 || (p1.visibility < 0.5 && p2.visibility < 0.5)) return null

                const v1 = new THREE.Vector3(p1.x - 0.5, (1 - p1.y) - 0.5, -p1.z)
                const v2 = new THREE.Vector3(p2.x - 0.5, (1 - p2.y) - 0.5, -p2.z)

                const distance = v1.distanceTo(v2)
                const position = v1.clone().lerp(v2, 0.5)

                // Rotation logic: point cylinder from v1 to v2
                const quaternion = new THREE.Quaternion()
                const direction = new THREE.Vector3().subVectors(v2, v1).normalize()
                quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)

                return (
                    <mesh
                        key={`bone-${i}`}
                        position={position}
                        quaternion={quaternion}
                        scale={[1, distance, 1]}
                        geometry={cylinderGeo}
                        material={boneMat}
                    />
                )
            })}
        </group>
    )
}
