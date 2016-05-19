import * as macro from '../../../macro';
import vtkInteractorStyle from '../../../Rendering/Core/InteractorStyle';
import { STATES } from '../../../Rendering/Core/InteractorStyle/Constants';

// ----------------------------------------------------------------------------
// Global methods
// ----------------------------------------------------------------------------

// Add module-level functions or api that you want to expose statically via
// the next section...

// ----------------------------------------------------------------------------
// Static API
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// vtkMyClass methods
// ----------------------------------------------------------------------------

function vtkInteractorStyleTrackballCamera(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkInteractorStyleTrackballCamera');

  // Public API methods
  publicAPI.handleMouseMove = () => {
    const pos = model.interactor.getEventPosition(model.interactor.getPointerIndex());

    switch (model.state) {
      case STATES.VTKIS_ROTATE:
        publicAPI.findPokedRenderer(pos.x, pos.y);
        publicAPI.rotate();
        publicAPI.invokeInteractionEvent({ type: 'InteractionEvent' });
        break;

      // case STATES.VTKIS_PAN:
      //   this->FindPokedRenderer(x, y);
      //   this->Pan();
      //   this->InvokeEvent(vtkCommand::InteractionEvent, NULL);
      //   break;

      // case STATES.VTKIS_DOLLY:
      //   this->FindPokedRenderer(x, y);
      //   this->Dolly();
      //   this->InvokeEvent(vtkCommand::InteractionEvent, NULL);
      //   break;

      // case STATES.VTKIS_SPIN:
      //   this->FindPokedRenderer(x, y);
      //   this->Spin();
      //   this->InvokeEvent(vtkCommand::InteractionEvent, NULL);
      //   break;
      default:
        break;
    }
  };

//----------------------------------------------------------------------------
  publicAPI.handleLeftButtonPress = () => {
    const pos = model.interactor.getEventPosition(model.interactor.getPointerIndex());
    publicAPI.findPokedRenderer(pos.x, pos.y);
    if (model.currentRenderer === null) {
      return;
    }

    publicAPI.grabFocus(model.eventCallbackCommand);
    if (model.interactor.getShiftKey()) {
      if (model.interactor.getControlKey()) {
        publicAPI.startDolly();
      } else {
        publicAPI.startPan();
      }
    } else {
      if (model.interactor.getControlKey()) {
        publicAPI.startSpin();
      } else {
        publicAPI.startRotate();
      }
    }
  };

  //--------------------------------------------------------------------------
  publicAPI.handleLeftButtonRelease = () => {
    switch (model.state) {
      case STATES.VTKIS_DOLLY:
        publicAPI.endDolly();
        break;

      case STATES.VTKIS_PAN:
        publicAPI.endPan();
        break;

      case STATES.VTKIS_SPIN:
        publicAPI.endSpin();
        break;

      case STATES.VTKIS_ROTATE:
        publicAPI.endRotate();
        break;

      default:
        break;
    }

    if (model.interactor) {
      publicAPI.releaseFocus();
    }
  };

  //--------------------------------------------------------------------------
  publicAPI.rotate = () => {
    if (model.currentRenderer === null) {
      return;
    }

    const rwi = model.interactor;

    const lastPtr = model.interactor.getPointerIndex();
    const pos = model.interactor.getEventPosition(lastPtr);
    const lastPos = model.interactor.getLastEventPosition(lastPtr);

    const dx = pos.x - lastPos.x;
    const dy = pos.y - lastPos.y;

    const size = model.currentRenderer.getRenderWindow().getSize();

    const deltaElevation = -20.0 / size[1];
    const deltaAzimuth = -20.0 / size[0];

    const rxf = dx * deltaAzimuth * model.motionFactor;
    const ryf = dy * deltaElevation * model.motionFactor;

    const camera = model.currentRenderer.getActiveCamera();
    camera.azimuth(rxf);
    camera.elevation(ryf);
    camera.orthogonalizeViewUp();

    if (model.autoAdjustCameraClippingRange) {
      model.currentRenderer.resetCameraClippingRange();
    }

    if (rwi.getLightFollowCamera()) {
      model.currentRenderer.updateLightsGeometryToFollowCamera();
    }

    rwi.render();
  };
}

// ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------

const DEFAULT_VALUES = {
  motionFactor: 10.0,
};

// ----------------------------------------------------------------------------

export function extend(publicAPI, model, initialValues = {}) {
  Object.assign(model, DEFAULT_VALUES, initialValues);

  // Inheritance
  vtkInteractorStyle.extend(publicAPI, model);

  // Object methods
  macro.obj(publicAPI, model);

  // Create get-only macros
  // macro.get(publicAPI, model, ['myProp2', 'myProp4']);

  // Create get-set macros
  macro.setGet(publicAPI, model, ['motionFactor']);

  // For more macro methods, see "Sources/macro.js"

  // Object specific methods
  vtkInteractorStyleTrackballCamera(publicAPI, model);
}

// ----------------------------------------------------------------------------

export const newInstance = macro.newInstance(extend);

// ----------------------------------------------------------------------------

export default Object.assign({ newInstance, extend });
