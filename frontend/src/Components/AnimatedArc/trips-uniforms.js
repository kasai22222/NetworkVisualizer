// trips-uniforms.js
const uniformBlock = `
uniform tripsUniforms {
  vec2 timeRange;
} trips;
`;

export const tripsUniforms = {
  name: 'trips',
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    timeRange: 'vec2<f32>'
  }
};
