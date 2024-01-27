// https://github.com/fedorovvvv/svelte-floating-ui/blob/a331210/src/lib/index.ts

import { arrow as arrowCore, autoUpdate as _autoUpdate, computePosition } from '@floating-ui/dom';
import { onDestroy, tick } from 'svelte';
import { get } from 'svelte/store';
import type {
  AutoUpdateOptions,
  ComputePositionConfig,
  ComputePositionReturn,
  FloatingElement,
  Middleware,
  MiddlewareState,
  Padding,
  ReferenceElement,
  VirtualElement,
} from '@floating-ui/dom';
import type { Readable, Writable } from 'svelte/store';

export type ComputeConfig = Partial<ComputePositionConfig> & {
  onComputed?: (computed: ComputePositionReturn) => void;
  /**
   * false: Don't initialize autoUpdate;
   * true: Standard autoUpdate values from the documentation;
   * object: All as in the autoUpdate documentation. Your parameters are added to the default ones;
   * @default true
   */
  autoUpdate?: boolean | Partial<AutoUpdateOptions>;
};
export type UpdatePosition = (contentOptions?: Omit<ComputeConfig, 'autoUpdate'>) => void;
export type ReferenceAction = (node: HTMLElement | Writable<VirtualElement> | VirtualElement) => void;
export type ContentAction = (node: HTMLElement, contentOptions?: ComputeConfig) => void;
export type ArrowOptions = { padding?: Padding; element: Writable<HTMLElement | undefined | null> };

export function createFloatingActions(initOptions?: ComputeConfig): [ReferenceAction, ContentAction, UpdatePosition] {
  let referenceElement: ReferenceElement;
  let floatingElement: FloatingElement;
  const defaultOptions: Partial<ComputeConfig> = {
    autoUpdate: true,
  };
  let options: ComputeConfig | undefined = initOptions;

  const getOptions = (mixin?: object): ComputeConfig => {
    return { ...defaultOptions, ...initOptions, ...mixin };
  };

  const updatePosition: UpdatePosition = (updateOptions) => {
    if (referenceElement && floatingElement) {
      options = getOptions(updateOptions);
      computePosition(referenceElement, floatingElement, options).then((v) => {
        Object.assign(floatingElement.style, {
          position: v.strategy,
          left: `${v.x}px`,
          top: `${v.y}px`,
        });
        options?.onComputed && options.onComputed(v);
      });
    }
  };

  const referenceAction: ReferenceAction = (node) => {
    if ('subscribe' in node) {
      setupVirtualElementObserver(node);
      return {};
    } else {
      referenceElement = node;
      updatePosition();
    }
  };

  const contentAction: ContentAction = (node, contentOptions) => {
    let autoUpdateDestroy: ReturnType<typeof _autoUpdate> | undefined;
    floatingElement = node;
    options = getOptions(contentOptions);
    setTimeout(() => updatePosition(contentOptions), 0); //tick doesn't work
    updatePosition(contentOptions);
    const destroyAutoUpdate = () => {
      if (autoUpdateDestroy) {
        autoUpdateDestroy();
        autoUpdateDestroy = undefined;
      }
    };
    const initAutoUpdate = ({ autoUpdate } = options || {}): typeof autoUpdateDestroy => {
      destroyAutoUpdate();
      if (autoUpdate !== false) {
        tick().then(() => {
          return _autoUpdate(
            referenceElement,
            floatingElement,
            () => updatePosition(options),
            autoUpdate === true ? {} : autoUpdate,
          );
        });
      }
      return;
    };
    autoUpdateDestroy = initAutoUpdate();
    return {
      update(contentOptions: Parameters<typeof contentAction>[1]) {
        updatePosition(contentOptions);
        autoUpdateDestroy = initAutoUpdate(contentOptions);
      },
      destroy() {
        destroyAutoUpdate();
      },
    };
  };

  const setupVirtualElementObserver = (node: Readable<VirtualElement>) => {
    const unsubscribe = node.subscribe(($node) => {
      if (referenceElement === undefined) {
        referenceElement = $node;
        updatePosition();
      } else {
        // Preserve the reference to the virtual element.
        Object.assign(referenceElement, $node);
        updatePosition();
      }
    });
    onDestroy(unsubscribe);
  };

  return [referenceAction, contentAction, updatePosition];
}

export function arrow(options: ArrowOptions): Middleware {
  return {
    name: 'arrow',
    options,
    fn(args: MiddlewareState) {
      const element = get(options.element);

      if (element) {
        return arrowCore({
          element,
          padding: options.padding,
        }).fn(args);
      }

      return {};
    },
  };
}

export function computeArrowPosition({ placement, middlewareData }: ComputePositionReturn, offset = '-0.25rem') {
  if (!middlewareData.arrow) throw new Error('arrow middleware is not registered');

  const { x, y } = middlewareData.arrow;
  const staticSide = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right',
  }[placement.split('-')[0]];

  if (!staticSide) throw new Error('invalid placement');

  return {
    left: x == null ? '' : `${x}px`,
    top: y == null ? '' : `${y}px`,
    [staticSide]: offset,
  };
}
