import { ArcLayer } from "deck.gl";

const uniformBlock = `\
uniform timeUniforms {
  float currentTime;
  float duration;
} time;
`;

export const timeUniforms = {
  name: 'time',
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    currentTime: 'f32',
    duration: 'f32'
  }
}

export default class AnimatedArcLayer extends ArcLayer {
  layerName = 'AnimatedArcLayer'
  defaultProps = {
    duration: { type: 'number', value: 1.5 },
    getStartTime: { type: 'accessor', value: 0 }
  }

  getShaders() {
    const shaders = super.getShaders();
    shaders.inject = {
      'vs:#decl': `\
in float instanceStartTime;
in float segmentRatio;
out float vProgress;
`,
      'vs:#main-end': `\
float elapsedTime = time.currentTime - instanceStartTime;
float normalizedTime = mod(elapsedTime, time.duration) / time.duration;

// Optimize calculations by pre-computing constants
const float TAIL_LENGTH = 0.1;
const float FADE_FACTOR = 0.3;
float edgeStart = normalizedTime;
float edgeEnd = normalizedTime + TAIL_LENGTH;
float fade = TAIL_LENGTH * FADE_FACTOR;

// Simplified fade calculations
float fadeIn = smoothstep(edgeStart, edgeStart + fade, segmentRatio);
float fadeOut = 1.0 - smoothstep(edgeEnd - fade, edgeEnd, segmentRatio);
vProgress = fadeIn * fadeOut;
`,
      'fs:#decl': `\
in float vProgress;
`,
      'fs:DECKGL_FILTER_COLOR': `\
color.a *= vProgress;`
    }
    shaders.modules = [...shaders.modules, timeUniforms]
    return shaders
  }

  initializeState() {
    super.initializeState();
    this.getAttributeManager().addInstanced({
      instanceStartTime: {
        size: 1,
        accessor: 'getStartTime'
      }
    })
  }

  draw(params) {
    const { duration } = this.props;
    const timeProps = {
      currentTime: performance.now() / 1000, // Convert to seconds
      duration
    }
    const model = this.state.model;
    model.shaderInputs.setProps({ time: timeProps })
    super.draw(params)
  }
}