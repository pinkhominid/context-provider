const store = new WeakMap();
const providerId = Symbol('provider');
const GET_PROVIDER_EVENT_TYPE = '@kuscamara/context-provider';

/**
 * Creates a Provider component that notifies changes on its
 * `value` property.
 *
 * @param {*} initialValue Initial value of the Provider
 * @param {*} identifier Provider ID
 */
const createProvider = (initialValue, identifier) => {
  return class Provider extends HTMLElement {
    constructor() {
      super();
      this.value = initialValue;
      this[providerId] = identifier;
      this.onGetProvider = this.onGetProvider.bind(this);
    }

    set value(value) {
      if (this.value !== value) {
        store.set(this, value);
        this.dispatchEvent(new Event('context-changed'));
      }
    }

    get value() {
      return store.get(this);
    }

    connectedCallback() {
      if (super.connectedCallback) {
        super.connectedCallback();
      }

      this.addEventListener(GET_PROVIDER_EVENT_TYPE, this.onGetProvider);
    }

    disconnectedCallback() {
      this.removeEventListener(GET_PROVIDER_EVENT_TYPE, this.onGetProvider);

      if (super.disconnectedCallback) {
        super.disconnectedCallback();
      }
    }

    onGetProvider(e) {
      if (this[providerId] !== e.detail.identifier) return;
      e.stopPropagation();
      e.detail.provider = this;
    }
  };
};

/**
 * Gets the Provider component that matches the identifier.
 *
 * @param {*} identifier Provider identifier.
 * @param {HTMLElement} context
 */
const getProvider = (identifier, context) => {
  const eventInit = { bubbles: true, composed: true, detail: { identifier } };
  const event = new CustomEvent(GET_PROVIDER_EVENT_TYPE, eventInit);
  context.dispatchEvent(event);
  return event.detail.provider;
};

export { createProvider, getProvider };
