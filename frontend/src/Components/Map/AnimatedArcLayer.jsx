import { ArcLayer } from "deck.gl";

const uniformBlock = `\
uniform progressUniforms {
  vec2 progressRange;
} progress;
`;

export const progressUniforms = {
  name: 'progress',
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    progressRange: 'vec2<f32>'
  }
}

export default class AnimatedArcLayer extends ArcLayer {
  layerName = 'AnimatedArcLayer'
  defaultProps = {
    progressRange: { type: 'array', compare: true, value: [0, 1] },
    getProgress: { type: 'accessor', value: 1.0 }
  }

  getShaders() {
    const shaders = super.getShaders();
    shaders.inject = {
      'vs:#decl': `\
in float instanceProgress;
in float segmentRatio;
out float vProgress;
`,
      'vs:#main-end': `\
float progressClamped = clamp(instanceProgress, progress.progressRange.x, progress.progressRange.y);
float normalizedProgress = (progressClamped - progress.progressRange.x) / (progress.progressRange.y - progress.progressRange.x);

float tailLength = 0.1;
float edgeStart = normalizedProgress;
float edgeEnd = normalizedProgress + tailLength;

float fade = tailLength * 0.3;

float fadeIn = smoothstep(edgeStart, edgeStart + fade, segmentRatio);
float fadeOut = 1.0 - smoothstep(edgeEnd - fade, edgeEnd, segmentRatio);
vProgress = fadeIn * fadeOut;
`,
      'fs:#decl': `\
in float vProgress;
`,
      'fs:DECKGL_FILTER_COLOR': `\
color.a *= vProgress;  `
      //       'fs:DECKGL_FILTER_COLOR': `\
      // color.a *= vProgress;
      // `
    }
    shaders.modules = [...shaders.modules, progressUniforms]
    return shaders
  }
  initializeState() {
    super.initializeState();
    this.getAttributeManager().addInstanced({
      instanceProgress: {
        size: 1,
        accessor: 'getProgress'
      }
    })
  }
  draw(params) {
    // super.draw({
    //   uniforms: {
    //     ...uniforms,
    //     progressRange: this.props.progressRange
    //   }
    // })
    const { progressRange } = this.props;
    const progressProps = { progressRange }
    const model = this.state.model;
    model.shaderInputs.setProps({ progress: progressProps })
    super.draw(params)
  }
}

