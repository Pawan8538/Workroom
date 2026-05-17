import React from 'react';

const MeetingRoom = () => {
  return (
    <group position={[8, 0, 0]}>
      {/* Glass Walls */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[4, 3, 4]} />
        <meshStandardMaterial color="lightblue" transparent opacity={0.2} />
      </mesh>
      
      {/* Table */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[1, 1, 0.1, 32]} />
        <meshStandardMaterial color="#444" />
      </mesh>
    </group>
  );
};

export default MeetingRoom;
