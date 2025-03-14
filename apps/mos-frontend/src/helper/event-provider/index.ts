export type TEventProvider = {
  callbacks: Function[]
  trigger: (data: any) => void
  on: (cb: Function) => void;
  off: (cb: Function) => void;
  destroy: () => void
};

export function EventProvider() {
  (this as TEventProvider).callbacks = [];
  (this as TEventProvider).trigger = function(data: any) {
    (this as TEventProvider).callbacks.forEach((cb: Function) => {
      cb(data)
    })
  };
  (this as TEventProvider).on = function(cb: Function) {
    (this as TEventProvider).callbacks.push(cb);
  };
  (this as TEventProvider).off = function(cb: Function) {
    const index = (this as TEventProvider).callbacks.indexOf(cb);
    if (index !== -1) {
      (this as TEventProvider).callbacks.splice(index, 1);
    }
  };
  (this as TEventProvider).destroy = function() {
    (this as TEventProvider).callbacks = []
  }
}