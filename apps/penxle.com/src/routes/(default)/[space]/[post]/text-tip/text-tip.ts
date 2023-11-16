// original source from - https://github.com/AdamJaggard/text-tip

import './text-tip.css';

enum IconFormat {
  URL = 'url',
  SVGSprite = 'svgsprite',
  Font = 'font',
}

type Button = {
  title: string;
  icon?: string;
  callback: (selection: string) => void;
};

type Config = {
  scope?: HTMLElement | string;
  minLength?: number;
  maxLength?: number;
  iconFormat?: IconFormat;
  buttons: Button[];
  theme?: 'none' | 'default';
  mobileOSBehaviour?: 'hide' | 'normal';
  on?: {
    show?: () => void;
    hide?: () => void;
  };
};

export class TextTip {
  config: Config = {
    scope: 'body',
    minLength: 1,
    maxLength: Number.POSITIVE_INFINITY,
    buttons: [],
    theme: 'default',
    mobileOSBehaviour: 'normal',
  };
  // @ts-expect-error: will be set in setupScope method
  scopeEl: HTMLElement;
  // @ts-expect-error: will be set in setupTooltip method
  tipEl: HTMLElement;
  // @ts-expect-error: will be set in setupTooltip method
  tipWidth: number;
  id: number;
  open = false;
  isMobileOS = false;

  static instanceCount = 0;

  constructor(config: Config) {
    if (window.getSelection === undefined) {
      throw new TypeError('TextTip: Selection api not supported in this browser');
    }

    if (typeof config !== 'object') {
      throw new TypeError('TextTip: No config supplied');
    }

    Object.assign(this.config, config);

    if (config.buttons === undefined) {
      throw new TypeError('TextTip: No buttons supplied');
    }

    this.isMobileOS = /ipad|iphone|ipod|android/i.test(navigator.userAgent);
    this.id = TextTip.getID();

    // Hide on mobile OS's, they have their own conflicting tooltips
    if (this.config.mobileOSBehaviour === 'hide' && this.isMobileOS) return;

    this.setupScope();
    this.setupTooltip();
    this.setupEvents();
  }

  private setupScope = () => {
    if (typeof this.config.scope === 'string') {
      const node = document.querySelector<HTMLElement>(this.config.scope);
      if (!node) throw new Error('TextTip: Scope element not found');
      this.scopeEl = node;
    } else if (this.config.scope instanceof HTMLElement) {
      this.scopeEl = this.config.scope;
    }

    this.scopeEl.dataset.texttipScopeId = this.id.toString();
  };

  private setupTooltip = () => {
    const inner = document.createElement('div');
    inner.classList.add('texttip__inner');

    for (const [index, btn] of this.config.buttons.entries()) {
      if (!btn.callback || !btn.title) {
        throw new Error('TextTip: All buttons should have a callback, icon and title property');
      }

      const btnEl = document.createElement('div');

      btnEl.classList.add('texttip__btn');
      btnEl.setAttribute('role', 'button');
      btnEl.dataset.texttipBtnIndex = index.toString();
      btnEl.style.transitionDelay = 40 * (index + 1) + 'ms';

      switch (this.config.iconFormat) {
        case IconFormat.URL:
          btnEl.innerHTML = `<img src="${btn.icon}" alt="${btn.title}">`;
          break;
        case IconFormat.SVGSprite:
          /*
           * The base64 image overlay hack is needed to make the click events work
           * without it the events are swallowed completely for some reason (probably shadow dom related)
           */
          btnEl.innerHTML = `
						<svg xmlns="http://www.w3.org/2000/svg" title="${btn.title}" pointer-events="none">
							<use xlink:href="${btn.icon}"></use>
						</svg>
						<img class="texttip__btn-cover" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" alt="" aria-hidden="true" />
						`;
          break;
        case IconFormat.Font:
          btnEl.innerHTML = `<i class="${btn.icon}" title="${btn.title}"></i>`;
          break;
        default:
          btnEl.innerHTML = btn.title;
      }

      inner.append(btnEl);
    }

    const tooltip = document.createElement('div');
    tooltip.classList.add('texttip', 'texttip--theme-' + this.config.theme);
    tooltip.dataset.textipIconformat = this.config.iconFormat;
    tooltip.dataset.texttipId = this.id.toString();
    tooltip.setAttribute('role', 'tooltip');
    tooltip.setAttribute('aria-hidden', 'true');
    tooltip.append(inner);

    document.body.append(tooltip);

    this.tipEl = tooltip;
    this.tipWidth = this.tipEl.offsetWidth;
  };

  private setupEvents = () => {
    document.addEventListener('mouseup', this.onSelectionChanged);
    document.addEventListener('mousedown', this.onSelectionChanged);

    for (const btn of this.tipEl.querySelectorAll('.texttip__btn')) {
      btn.addEventListener('click', this.onButtonClick);
    }
  };

  public destroyEvents = () => {
    document.removeEventListener('mouseup', this.onSelectionChanged);
    document.removeEventListener('mousedown', this.onSelectionChanged);

    for (const btn of this.tipEl.querySelectorAll('.texttip__btn')) {
      btn.removeEventListener('click', this.onButtonClick);
    }
  };

  private onSelectionChanged = () => {
    if (this.selectionValid()) {
      this.updatePosition();
      this.show();
    } else {
      this.hide();
    }
  };

  private selectionValid = () => {
    const selection = window.getSelection();
    if (!selection) return false;

    const selStr = selection.toString();
    const selLength = selStr.length;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (selLength < this.config.minLength! || selLength > this.config.maxLength!) {
      return false;
    }

    const anchorNodeParent = selection.anchorNode?.parentElement;
    const focusNodeParent = selection.focusNode?.parentElement;

    if (!anchorNodeParent || !focusNodeParent) return false;

    const anchorParent = anchorNodeParent.closest(`[data-texttip-scope-id="${this.id}"]`);
    const focusParent = focusNodeParent.closest(`[data-texttip-scope-id="${this.id}"]`);

    // Selection must start and end within specified scope
    return !!anchorParent && !!focusParent;
  };

  private updatePosition = () => {
    const selection = window.getSelection();
    if (!selection) return;

    // Allows us to measure where the selection is on the page relative to the viewport
    const range = selection.getRangeAt(0).cloneRange();

    range.collapse(false); // collapse the range to its end

    // Insert the dummy node at the end of the range
    const nodeAtRangeEnd = document.createElement('span');
    range.insertNode(nodeAtRangeEnd);

    // Get the bounding rectangle of the dummy node
    const rect = nodeAtRangeEnd.getBoundingClientRect();

    nodeAtRangeEnd.remove();
    range.detach();

    const { left: selLeft, top: selTop } = rect;

    // Middle of selection width
    let newTipLeft = selLeft - window.scrollX;

    // Right above selection
    const newTipBottom = window.innerHeight - selTop - window.scrollY;

    // Stop tooltip bleeding off of left or right edge of screen
    // Use a buffer of 20px so we don't bump right against the edge
    // The tooltip transforms itself left minus 50% of it's width in css
    // so this will need to be taken into account

    const buffer = 20;
    const tipHalfWidth = this.tipWidth / 2;

    // "real" means after taking the css transform into account
    const realTipLeft = newTipLeft - tipHalfWidth;
    const realTipRight = realTipLeft + this.tipWidth;

    if (realTipLeft < buffer) {
      // Correct for left edge overlap
      newTipLeft = buffer + tipHalfWidth;
    } else if (realTipRight > window.innerWidth - buffer) {
      // Correct for right edge overlap
      newTipLeft = window.innerWidth - buffer - tipHalfWidth;
    }

    this.tipEl.style.left = newTipLeft + 'px';
    this.tipEl.style.bottom = newTipBottom + 'px';
  };

  private onButtonClick = (event: Event) => {
    event.stopPropagation();

    const btn = event.currentTarget as HTMLElement;
    const { texttipBtnIndex } = btn.dataset;
    if (!texttipBtnIndex) return;

    const btnIndex = Number.parseInt(texttipBtnIndex, 10);
    const selection = window.getSelection();
    if (!selection) return;

    this.config.buttons[btnIndex].callback(selection.toString());
  };

  private show = () => {
    if (this.open) return;

    this.open = true;
    this.tipEl.classList.add('texttip--show');
    this.tipEl.setAttribute('aria-hidden', 'true');

    // Callback
    if (this.config.on && typeof this.config.on.show === 'function') this.config.on.show();
  };

  private hide = () => {
    if (!this.open) return;

    this.open = false;
    this.tipEl.classList.remove('texttip--show');
    this.tipEl.setAttribute('aria-hidden', 'false');

    // Callback
    if (this.config.on && typeof this.config.on.hide === 'function') this.config.on.hide();
  };

  private static getID = () => ++TextTip.instanceCount;
}
