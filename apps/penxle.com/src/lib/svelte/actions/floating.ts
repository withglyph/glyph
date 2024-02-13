import { arrow, autoUpdate, computePosition, flip, hide, offset, shift } from '@floating-ui/dom';
import { match } from 'ts-pattern';
import type { FloatingElement, Placement, ReferenceElement } from '@floating-ui/dom';
import type { Action } from 'svelte/action';

type ReferenceAction = Action<ReferenceElement>;
type FloatingAction = Action<FloatingElement>;
type ArrowAction = Action<HTMLElement>;
type UpdatePosition = () => Promise<void>;

type CreateFloatingActionsOptions = {
  placement: Placement;
  offset?: number;
  arrow?: boolean;
};

type CreateFloatingActionsReturn = {
  anchor: ReferenceAction;
  floating: FloatingAction;
  arrow: ArrowAction;
  update: UpdatePosition;
};

export function createFloatingActions(options?: CreateFloatingActionsOptions): CreateFloatingActionsReturn {
  let referenceElement: ReferenceElement | undefined;
  let floatingElement: FloatingElement | undefined;
  let arrowElement: HTMLElement | undefined;
  let cleanupAutoUpdate: (() => void) | undefined;

  const updatePosition: UpdatePosition = async () => {
    if (!referenceElement || !floatingElement) {
      return;
    }

    const { x, y, placement, strategy, middlewareData } = await computePosition(referenceElement, floatingElement, {
      strategy: 'absolute',
      placement: options?.placement,
      middleware: [
        !!options?.offset && offset(options.offset),
        shift({ padding: 8 }),
        flip(),
        hide(),
        !!options?.arrow && arrowElement && arrow({ element: arrowElement, padding: 16 }),
      ],
    });

    Object.assign(floatingElement.style, {
      position: strategy,
      top: `${y}px`,
      left: `${x}px`,
    });

    if (middlewareData.hide) {
      Object.assign(floatingElement.style, {
        visibility: middlewareData.hide.referenceHidden ? 'hidden' : 'visible',
      });
    }

    if (middlewareData.arrow && arrowElement) {
      const { x, y } = middlewareData.arrow;

      const side = match(placement)
        .with('top', 'top-start', 'top-end', () => 'bottom')
        .with('bottom', 'bottom-start', 'bottom-end', () => 'top')
        .with('left', 'left-start', 'left-end', () => 'right')
        .with('right', 'right-start', 'right-end', () => 'left')
        .exhaustive();

      Object.assign(arrowElement.style, {
        left: x === undefined ? '' : `${x}px`,
        top: y === undefined ? '' : `${y}px`,
        [side]: `${-arrowElement.offsetHeight / 2}px`,
        transform: 'rotate(45deg)',
      });
    }
  };

  const mount = async () => {
    if (!referenceElement || !floatingElement) {
      return;
    }

    await updatePosition();

    cleanupAutoUpdate?.();
    cleanupAutoUpdate = autoUpdate(referenceElement, floatingElement, updatePosition);
  };

  const unmount = () => {
    if (cleanupAutoUpdate) {
      cleanupAutoUpdate();
      cleanupAutoUpdate = undefined;
    }
  };

  const referenceAction: ReferenceAction = (element) => {
    referenceElement = element;
    mount();

    return {
      destroy: () => {
        unmount();
        referenceElement = undefined;
      },
    };
  };

  const floatingAction: FloatingAction = (element) => {
    document.body.append(element);
    Object.assign(element.style, {
      position: 'absolute',
      top: '0',
      left: '0',
    });

    floatingElement = element;
    mount();

    return {
      destroy: () => {
        unmount();
        floatingElement?.remove();
        floatingElement = undefined;
      },
    };
  };

  const arrowAction: ArrowAction = (element) => {
    Object.assign(element.style, {
      position: 'absolute',
    });

    arrowElement = element;
    mount();

    return {
      destroy: () => {
        unmount();
        arrowElement = undefined;
      },
    };
  };

  return {
    anchor: referenceAction,
    floating: floatingAction,
    arrow: arrowAction,
    update: updatePosition,
  };
}
